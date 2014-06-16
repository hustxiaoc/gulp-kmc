###使用文档
使用之前请先用k2cmd将您的KISSY模块转为符合commonJs规范的模块，具体转换方法参考k2cmd文档 https://www.npmjs.org/package/k2cmd

gulfile.js 编写示例
```js
var gulp = require('gulp');

var kmc = require('gulp-kmc');



var src = "./src/mt",
    dest = "./build/mt";

kmc.config({
           src:src,
           dest:dest,
           packages:[{
                       name: 'mt',
                       combine:true,
                       base: dest
                    }],
           map: [
                   ['mt/', 'taojie/mt/'] //修改打包路径
               ]
});

gulp.task('kmc', function() {

    var stream = gulp.src(src+"/**/*.js")
       //转换cmd模块为kissy模块
        .pipe(kmc.cmd2k({
            minify: true,
            exclude: ['tasks'],//忽略该目录
            ignoreFiles: ['.combo.js', '-min.js'],//忽略该类文件
            depFilePath: dest +'/mods-dep.js'
        }))
        //合并文件
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
