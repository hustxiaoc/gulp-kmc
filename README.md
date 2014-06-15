gulfile.js
```js
var gulp = require('gulp'),
    kmc = require('gulp-kmc');

gulp.task('kmc', function() {
    var src = "./build_cmd/mt",
        dest = "./build_gulp/mt";

    kmc.config({
               src:"./build_cmd/mt",
               packages:[{
                           name: 'mt',
                           path: dest
                        }]
         });

    return gulp.src(src+"/**/*.js")
        .pipe(kmc.cmd2k({
            minify: true,
            exclude: ['tasks'],
            ignoreFiles: ['.combo.js', '-min.js'],
            depFilePath: dest +'/mods-dep.js'
        }))
        .pipe(kmc.combo({
             minify:true,
             files:[{
                       src: src+'/index.js',
                       dest: dest+'/core.js'
                   }]
         }))
        .pipe(gulp.dest(dest));
});

gulp.task('default', ['kmc']);
```
