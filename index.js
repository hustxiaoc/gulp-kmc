'use strict';
var through2 = require('through2'),
    gutil = require('gulp-util'),
    PluginError = gutil.PluginError,
    path = require('path'),
    minimatch = require("minimatch"),
    gulp = require("gulp"),
    child_process = require('child_process'),
    kmd = require("kmd");

var pathSeparatorRe = /[\/\\]/g;

var server ;

var depMap = {},
    realDepMap = {};

var moduleCache = {};

function kmc(){

}

kmd.utils.mix(kmc, {
    config: kmd.config,
    convert: function(opt) {
        var buffer = [],
            opt = opt||{};

        opt = opt || {};
        
	    function handle(file, enc, callback) {
            if (file.isNull()) {
                return callback();
            }
            if (file.isStream()) {
                this.emit('error', new PluginError('gulp-kmc',  'Streaming not supported'));
                return callback();
            }

            var ignore = false;

            if(opt.exclude) {
                ignore = opt.exclude.some(function(item) {
                    return path.dirname(file.path).split(pathSeparatorRe).some(function(pathName) {
                        return minimatch(pathName, item);
                    });
                });
            }

            if(!ignore && opt.ignoreFiles) {
                ignore = opt.ignoreFiles.some(function(item) {
                    return minimatch(path.basename(file.path), item);
                });
            }

            if(ignore) {
                this.push(file);
                return callback();
            }

            var r = kmd.convert(file.contents.toString(), {
                        filePath:file.path,
                        define:opt.define,
                        modulex: opt.modulex,
                        kissy: opt.kissy
                    });

            file.contents = new Buffer(r.source);
            file.info = r;
            moduleCache[r.moduleInfo.moduleName] = file;
            buffer.push(file);
            callback(null);
        }

        function endStream(callback) {
            var self = this;

            buffer.forEach(function(file){
               self.push(file);
            });
            return callback();
        }

	    return through2.obj(handle, endStream);
    },
    combo: function(opt) {

       var combined = {},
           opt = opt || {},
           combo_files = opt.files,
           modules = [],
           config = null;

       var buffer = [];

       opt = opt || {};

       function endStream(callback) {
           var self = this;
           if (buffer.length === 0) return this.emit('end');
           kmd.config("requires",realDepMap);

           if(combo_files && combo_files.length) {

               combo_files.forEach(function(file){
                   var moduleName,
                       has = modules.some(function(f){
                                   var pkgName = f.split('/')[0];
                                   if(file.src.indexOf(pkgName)!==0) {
                                      file.src = path.join(pkgName, file.src);
                                   }
                                   var mod = kmd.getModuleInfo(file.src);
                                   moduleName = mod && mod.moduleName;
                                   return moduleName == f;

                             });
                   if(has){
                      var dependencies = kmd.combo(file.src, opt);
                      var extra = "/*\ncombined files by gulp-kmc:\n\n" + dependencies.join("\n")+"\n*/\n\n";

                      var ff = moduleCache[moduleName],
                          contents = [],
                          info = ff && ff.info;


                      if(dependencies && dependencies.length) {
                           dependencies.map(function(dependency){
                               if(moduleCache[dependency]) {
                                   contents.push(moduleCache[dependency].contents.toString());
                               }
                           })
                      }

                      var base = path.resolve(info.moduleInfo.package.base),
                          pkgName = info.moduleInfo.package.name,
                          basename = file.dest.replace(pkgName,'');

                      if(info.moduleInfo.package.ignorePackageNameInUri === false) {
                          basename = path.join(pkgName,basename);
                      }

                      var srcFile = new gutil.File({
                                       base:base,
                                       path:path.join(base, basename),
                                       contents: new Buffer(extra+contents.join("\n"))
                                   });
                      srcFile.info = info;
                      buffer.push(srcFile);

                       //生成依赖配置文件
                      var call = 'require';

                      if(contents[0].indexOf('KISSY.add')>-1) {
                            call = 'KISSY';
                      }else if(contents[0].indexOf('modulex.add')>-1) {
                            call = 'modulex';
                      }

                      if(opt.deps !== false) {
                          var dep_file = (opt.deps||'{pkgName}-deps.js').replace('{pkgName}',info.moduleInfo.package.name),
                              code ="/*generated by gulp-kmc*/\n"+ call +".config('requires'," + JSON.stringify(depMap,null,4) +');'

                          buffer.push(new gutil.File({
                              contents:new Buffer(code),
                              path:path.join(base,dep_file),
                              base:base
                          }));
                          gutil.log('dependency  file ' + gutil.colors.green(dep_file) + ' is created.');
                      }
                      gutil.log('combined  file ' + gutil.colors.green(file.dest) + ' is created.');
                   }
               });
           }

           buffer.forEach(function(file){
               self.push(file);
           });

           return callback();
       }

       return through2.obj(function (file, enc, callback) {
            if (file.isNull()) {
                return callback();
            }

            if (file.isStream()) {
                this.emit('error', new PluginError('gulp-kmc',  'Streaming not supported'));
                return callback();
            }

            var r = file.info;
            if(!r) {
                r = kmd.convert(file.contents.toString(), {
                                     filePath:file.path
                                  });
                file.info = r;
                file.contents = new Buffer(r.source);
                moduleCache[r.moduleInfo.moduleName] = file;
            }

            if(r.dependencies.length && !depMap[r.moduleInfo.moduleName]) {
                var requires = [],realRequires = [];
                r.dependencies.forEach(function(dep) {
                    requires.push(dep);
                    realRequires.push(dep);
                });
                realDepMap[r.moduleInfo.moduleName] = realRequires
                depMap[r.moduleInfo.moduleName] = requires
            }

            modules.push(file.info.moduleInfo.moduleName);
            buffer.push(file);
            return callback();
        },endStream);
    },

    dest: function(outFolder, opt){

        return through2.obj(function(file, enc, callback){
            var folder = null,
                base = path.basename(file.base);

            if(file.moduleInfo) {
                var pkg = file.moduleInfo.package;
                if(outFolder[pkg.name]) {
                    folder = outFolder[pkg.name];
                }else if(outFolder["*"]) {
                    folder = outFolder[pkg.name];
                }else {
                    folder = outFolder;
                }
            }else {
                folder = outFolder["*"] || outFolder;
            }
            if(!folder) {
                gutil.log(gutil.colors.green('[error]')+' file '+gutil.colors.red(file.path)+' does not have a valid out put folder! ');
                return callback();
            }
            gulp.dest.call(gulp, folder, opt).write(file);
            return callback();
        });
    },

    server: function(config) {
        server = child_process.fork(path.resolve(__dirname,'./server.js'));

        if(config.proxy) {
            config.proxy = config.proxy.map(function(item){
                item[0] = item[0].toString();
                return item;
            });
        }

        server.send({
            cmd:'start',
            data:{
                config: config,
                packages: kmd.config('packages')
            }
        });
    }
});

process.on('uncaughtException', function(err){
    if(!server) {
        throw err;
    }
    server.send({
        cmd: 'exit'
    });
    server.on('exit', function(){
        throw err;
    });
});
module.exports = exports =  kmc;