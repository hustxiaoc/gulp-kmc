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
        var url = req.url,
            pathname = urlParse.parse(req.url).pathname,
            temp = pathname.split('/').filter(function(item){return item&&item.trim()});

        var info = packages[temp[0]];

        var paths = []
        if(info) {
             paths.push(path.join(info.base, pathname.replace(temp[0],'')));
        }

        paths.push(path.join(config['path'], pathname));

        paths.reverse();

        var i = 0;
        while(paths.length) {
            var filename = paths.pop();
            if(filename && fs.existsSync(filename)){
                res.writeHead(200, {'Content-Type': mime.lookup(filename)});
                if(!config.fixModule||!info) {
                    var more = i==0 && info;
                    more && res.write(getHeader());
                    fs.createReadStream(filename)
                      .on('end', function(){
                         more && res.end('\n});');
                      })
                      .pipe(res);
                }else {
                    var code = fs.readFileSync(filename).toString('utf-8');
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

module.exports = exports = function(_config){
    if(!isObject(_config)) {
        _config = {};
    }
    extend(config, {port:8080,path:'./build', fixModule: false} ,_config);
    packages = kmd.config('packages');
    return http.createServer(httpHandle).listen(config.port, function(){
                console.log('kmc server running at %s',config.port);
           });
}

exports.config = config;