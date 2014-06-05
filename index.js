'use strict';

var template = require('./lib/template'),
    through = require('through2'),
    gutil = require('gulp-util'),
    fs = require('fs'),
    path = require('path'),
    os = require('os');

var kissy =  fs.readFileSync(path.join(__dirname,"lib/kissy.js")).toString(),
    tpl = template(kissy);

module.exports = function (options, settings) {
    settings = settings || {};
    options = options || {};
    settings.ext = typeof settings.ext === "undefined" ? ".html" : settings.ext;

    return through.obj(function (file, enc, cb) {

        if (file.isNull()) {
            this.push(file);
            return cb();
        }

        if (file.isStream()) {
            this.emit(
                'error',
                new gutil.PluginError('gulp-kmc', 'Streaming not supported')
            );
        }

        try {

            file.contents = new Buffer(tpl.render({body:file.contents.toString()}));
            file.path = gutil.replaceExtension(file.path, ".js");
        } catch (err) {
            console.log(file.path);
            this.emit('error', new gutil.PluginError('gulp-kmc', err.toString()));
        }


        this.push(file);
        cb();
    });
};