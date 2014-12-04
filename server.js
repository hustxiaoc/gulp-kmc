var http = require('http'),
    fs = require('fs'),
    urlParse = require('url'),
    path = require('path'),
    kmd = require("kmd"),
    mime = require('mime'),
    packages,
    config = {};

function isObject(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
}

function extend(obj) {
    var source, prop;
    for (var i = 1, length = arguments.length; i < length; i++) {
      source = arguments[i];
      for (prop in source) {
        if (hasOwnProperty.call(source, prop)) {
            obj[prop] = source[prop];
        }
      }
    }
    return obj;
}

var header = {
    define:'define(function(require, exports, module) {\n',
    modulex:'define(function(require, exports, module) {\n',
    kissy:'KISSY.add(function(S ,require, exports, module) {\n'
}

function getHeader() {
    if(config.kissy) {
        return header['kissy']
    }
    if(config.modulex) {
        return header['modulex']
    }
    return header['define'];
}
function httpHandle (req, res){
    try{
        var url = req.url,proxy = config.proxy;

        if(proxy && proxy.length) {
            proxy.some(function(item){
                var reg = item[0];
                if(reg.charAt(0) =='/' && reg.slice(-1) == '/') {
                    reg = new RegExp(reg.slice(1,-1));
                }

                if(reg.test && reg.test(url) || url.indexOf(reg)>-1) {
                    url = url.replace(reg, item[1]);
                    return true;
                }
            });
        }

        if(url.indexOf('http://')==0 || url.indexOf('http://') ==0 ) {
                return http.get(url, function(_res){
                             _res.pipe(res);
                        })
                        .on('error', function(err){
                            res.end(err.toString());
                         })
                        .end();
        }

        var pathname = urlParse.parse(url).pathname.slice(1),
            temp = pathname.split('/').filter(function(item){return item&&item.trim()}),
            keys = Object.keys(packages).sort(function(b,a){ return a.length - b.length}),
            info;

        keys.some(function(key){
            if(pathname.indexOf(key) ==0) {
                var s = pathname.replace(key,'');
                if(s && s.charAt(0) == '/') {
                    info = packages[key];
                    return true;
                }
            }
            return  false;
        });

        var paths = [];

        if(info) {
             paths.push(path.join(info.base, pathname.replace(info.name,'')));
        }

        paths.push(path.join(config['path'], pathname));

        paths.reverse();

        var i = 0;

        while(paths.length) {
            var filename = paths.pop(),
                extname = path.extname(pathname);

            if(filename && fs.existsSync(filename)){
                if(extname != '.js') {
                    info = false;
                }

                res.writeHead(200, {'Content-Type': mime.lookup(filename)});
                if(!config.fixModule||!info) {
                    var more = i==0 && info;
                    more && res.write(getHeader());
                    fs.createReadStream(filename)
                      .on('end', function(){
                         more && res.end('\n});');
                      })
                      .on('error', function(err){
                            res.writeHead(404);
                            res.end('not Found');
                            paths.length = 0;
                      })
                      .pipe(res);
                }else {
                    var code = fs.readFileSync(filename).toString('utf-8');
                    if(i>0) {
                        return res.end(code);
                    }
                    code = kmd.convert(code, {
                                                filePath:filename,
                                                define:config.define,
                                                modulex: config.modulex,
                                                kissy: config.kissy
                                             }).source;
                    res.end(code);
                }
                return;
            }
            i++;
        }

        res.writeHead(404);
        res.end('not Found');
    }catch(err){
        res.writeHead(500);
        res.end(err.toString());
    }
}

function startServer(_config, _packages){
    if(!isObject(_config)) {
        _config = {};
    }

    extend(config, {port:8080,path:'./build', fixModule: false} ,_config);
    packages = _packages;
    kmd.config('packages',packages);
    return http.createServer(httpHandle).listen(config.port, function(){
                console.log('kmc server running at %s',config.port);
           });
}

exports.config = config;

var started = false;
process.on('message', function(msg) {
  var cmd = msg.cmd,
      data = msg.data;

  if(cmd == 'start') {
    if(!started) {
        started = true;
        process.nextTick(function(){
            startServer(data.config, data.packages);
        });
    }
  }else if(cmd == 'exit') {
    process.exit(1);
  }
});