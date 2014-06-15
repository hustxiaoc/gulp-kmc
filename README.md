###使用文档
使用之前请先用k2cmd将您的KISSY模块转为符合commonJs规范的模块，具体转换方法参考k2cmd文档 https://www.npmjs.org/package/k2cmd

gulfile.js 编写示例
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
	//注意由于require关键字的特殊性请不要使用其他工具压缩代码！,本插件内置压缩功能，只需配置即可使用
    return gulp.src(src+"/**/*.js")
        //将commonJs模块转为KISSY模块，并生成模块依赖关系文件
        .pipe(kmc.cmd2k({
            minify: true,
            exclude: ['tasks'],
            ignoreFiles: ['.combo.js', '-min.js'],
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
