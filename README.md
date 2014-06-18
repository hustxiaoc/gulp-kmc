###安装
npm install gulp-kmc

###使用文档
使用之前请先用kmd将您的KISSY模块转为符合commonJs规范的模块，具体转换方法参考kmd文档 https://www.npmjs.org/package/kmd

gulfile.js 编写示例
```js
var gulp = require('gulp');

var kmc = require('gulp-kmc');



var src = "./src/mt",
    dest = "./build/mt";

kmc.config({
           depFilePath:dest+'mods-dep.js',//全局依赖文件关系，此处配置后下面的各个模块将不会再生成
           packages:[{
                       name: 'mt',
                       combine:true,
                       base: src
                    },
                
                    {
                       name: 'udata',
                       ignorePackageNameInUri:true, 
                       combine:true,
                       base: './'  //ignorePackageNameInUri为true时不用写包名
                    }]
});

gulp.task('kmc', function() {

     gulp.src(src+"/**/*.js")
       //转换cmd模块为kissy模块
        .pipe(kmc.convert({
            minify: true,//是否压缩
            //ext:"-min.js",//转换后文件扩展名，如果minify 为true则是压缩文件扩展名,同时也支持下面这种配置
             ext:{
                src:"-debug.js",//kissy1.5后添加debug参数会默认加载-debug.js
                min:".js"
             },
            exclude: ['tasks'],//忽略该目录
            ignoreFiles: ['.combo.js', '-min.js'],//忽略该类文件
            depFilePath: dest +'/mods-dep.js'
        }))
        //合并文件
        .pipe(kmc.combo({
             minify: true,
             ext:"-min.js",
             files:[{
                       src: src+'/index.js',
                       dest: dest+'/core.js'
                   }]
         }))
        .pipe(gulp.dest(dest));
        
    gulp.src("./udata/**/*.js")
            .pipe(kmc.convert({
                ignoreFiles: ['.combo.js', '-min.js'],
                depFilePath: dest +'/udata/mods-dep.js'
            }))
            .pipe(kmc.combo({
                 minify:true,
                 files:[{
                           src: './udata/index.js',
                           dest: dest+'/udata/core.js'
                       }]
             }))
            .pipe(gulp.dest(dest+"/udata"));


});

gulp.task('default', ['kmc']);
```
