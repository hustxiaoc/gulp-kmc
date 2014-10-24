'use strict';
var through2 = require('through2'),
<<<<<<< HEAD
=======
    Xtemplate = require('kissy-xtemplate'),
>>>>>>> a98c389dfaa5eab34fc62ea3f90d1209d2b7e891
    gutil = require('gulp-util'),
    PluginError = gutil.PluginError,
    path = require('path'),
    minimatch = require("minimatch"),
    gulp = require("gulp"),
	kmd = require("kmd");

var pathSeparatorRe = /[\/\\]/g;

var depMap = {},
    realDepMap = {};

var moduleCache = {};

<<<<<<< HEAD
function kmc(){

}

kmd.utils.mix(kmc, {
=======
function endsWith(str, suffix) {
    var ind = str.length - suffix.length;
    return ind >= 0 && str.indexOf(suffix, ind) === ind;
}

function parseExt(ext) {
    var _ext = {};

    if(!ext) {
        _ext = kmd.config("ext") || {
            min:"-min.js",
            src:".js"
        };
    }else if(typeof ext == "string") {
        _ext = {
            min:ext,
            src:".js"
        }
    }else {
        _ext = {
            min:ext.min||"-min.js",
            src:ext.src||".js"
        }
    }
    return _ext;
}


module.exports ={
>>>>>>> a98c389dfaa5eab34fc62ea3f90d1209d2b7e891
    config: kmd.config,
    xtpl: function (options) {

            options = options || {};
            options.outputCharset = options.outputCharset || 'utf8';
            options.inputCharset = options.inputCharset || 'utf8';

            var xtemp = new Xtemplate(options);

        	return through2.obj(function (file, enc, callback ) {
        		if (file.isNull()) {
        			this.push(file);
        			return cb();
        		}

        		if (file.isStream()) {
        			this.emit('error', new gutil.PluginError('gulp-kmc', 'Streaming not supported'));
        			return cb();
        		}

        		try {
                    if(file && file.path){
                        file.path = file.path.replace('.xtpl.html', '-xtpl.js');
                    }
                    var code = xtemp._compile(file.contents.toString(), file.path, options.inputCharset, options.outputCharset);
                    code = kmd.kissy2cmd.parse(code.toString(),{fromString:true});
        			file.contents = new Buffer(code);
        		} catch (err) {
        			this.emit('error', new gutil.PluginError('gulp-kmc', err));
        		}

        		this.push(file);
        		return callback();
        	});
        },
    convert: function(opt) {
        var buffer = [],
<<<<<<< HEAD
            opt = opt||{};

        opt = opt || {};

	    function handle(file, enc, callback) {
=======
            opt = opt||{},
            ext = parseExt(opt.ext);

        opt = opt || {};

	    function k2cmd(file, enc, callback) {
>>>>>>> a98c389dfaa5eab34fc62ea3f90d1209d2b7e891
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
<<<<<<< HEAD
                        filePath:file.path,
                        define:opt.define,
                        modulex: opt.modulex,
                        kissy: opt.kissy
                    });
=======
                                            filePath:file.path,
                                            fixModuleName:opt.fixModuleName || kmd.config("fixModuleName")
                                        });


            if(r.dependencies.length && !depMap[r.moduleInfo.moduleName]) {
                var requires = [],realRequires = [];
                r.dependencies.forEach(function(dep) {
                    requires.push(dep);
                    realRequires.push(dep);
                });
                realDepMap[r.moduleInfo.moduleName] = { requires: realRequires };
                depMap[r.moduleInfo.moduleName] = { requires: requires };
            }

            if(opt.minify) {
                var new_path = file.path.replace(/\.js$/, ext.min),
                    new_file = new gutil.File({
                                   contents:new Buffer(r.minify),
                                   path:new_path,
                                   base:file.base
                               });
                new_file.moduleInfo = r.moduleInfo;
                buffer.push(new_file);

            }
>>>>>>> a98c389dfaa5eab34fc62ea3f90d1209d2b7e891

            file.contents = new Buffer(r.source);
<<<<<<< HEAD
            file.info = r;
            moduleCache[r.moduleInfo.moduleName] = file;
=======
            file.moduleInfo = r.moduleInfo;
>>>>>>> a98c389dfaa5eab34fc62ea3f90d1209d2b7e891
            buffer.push(file);
            callback(null);
        }

        function endStream(callback) {
<<<<<<< HEAD
=======
            kmd.config("modules",realDepMap);

            if(kmd.config("depFilePath")) {
                var depFilePath = kmd.config("depFilePath");

                var code ="/*generated by KMD*/\nKISSY.config('modules'," + JSON.stringify(depMap,null,4) +');'


                this.push(new gutil.File({
                     contents:new Buffer(code),
                     path:depFilePath.replace(/\.js$/,ext.src),
                     base:path.dirname(depFilePath)
                }));

                this.push(new gutil.File({
                     contents:new Buffer(kmd.minify(code)),
                     path:depFilePath.replace(/\.js$/,ext.min),
                     base:path.dirname(depFilePath)
                }));
            }
>>>>>>> a98c389dfaa5eab34fc62ea3f90d1209d2b7e891
            var self = this;

            buffer.forEach(function(file){
               self.push(file);
            });
            return callback();
        }

<<<<<<< HEAD
	    return through2.obj(handle, endStream);
=======
	    return through2.obj(k2cmd, endStream);
>>>>>>> a98c389dfaa5eab34fc62ea3f90d1209d2b7e891
    },
    combo: function(opt) {

       var combined = {},
           opt = opt || {},
<<<<<<< HEAD
           combo_files = opt.files,
           modules = [],
=======
           ext = parseExt(opt.ext),
>>>>>>> a98c389dfaa5eab34fc62ea3f90d1209d2b7e891
           config = null;

       var buffer = [];

       opt = opt || {};
<<<<<<< HEAD

       function endStream(callback) {
=======

       function combo(_file, callback) {
            var combinedFile = [];

            if(combined[_file.path]) {
                return combinedFile;
            }

            if(opt && opt.files && opt.files.length) {
                opt.files.forEach(function(file){
                    if(path.resolve(file.src) == _file.path){
                       var info = kmd.combo(_file.path),
                           src = file.dest.replace(/\.js$/,ext.src),
                           dest = file.dest.replace(/\.js$/,ext.min);

                       var extra = "/*\n"+ new Date() +"\ncombined files by KMD:\n\n" + info.files.join("\n")+"\n*/\n\n";

                       var srcFile = new gutil.File({
                                        base:path.dirname(file.dest),
                                        path:src,
                                        contents: new Buffer(extra+info.source.join("\n"))
                                    });

                       srcFile.moduleInfo = _file.moduleInfo;
                       buffer.push(srcFile);

                       if(opt.minify) {
                            var minifyFile = new gutil.File({
                                                base:path.dirname(file.dest),
                                                path:dest,
                                                contents: new Buffer(info.minify.join(""))
                                             });
                            minifyFile.moduleInfo = _file.moduleInfo;
                            buffer.push(minifyFile);
                       }

                       gutil.log('combined  file ' + gutil.colors.green(file.dest) + ' is created.');

                    }
                });
            }
       }

       function endStream(callback) {
           if (buffer.length === 0) return this.emit('end');
>>>>>>> a98c389dfaa5eab34fc62ea3f90d1209d2b7e891
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

<<<<<<< HEAD
           buffer.forEach(function(file){
=======
           buffer.reverse().forEach(function(file){
>>>>>>> a98c389dfaa5eab34fc62ea3f90d1209d2b7e891
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
<<<<<<< HEAD

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
=======

            combo(file);

>>>>>>> a98c389dfaa5eab34fc62ea3f90d1209d2b7e891
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
    }
});

module.exports = exports =  kmc;
