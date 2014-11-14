###安装
npm install gulp-kmc

###使用文档

gulfile.js 编写示例
```js
var gulp = require('gulp');

var kmc = require('gulp-kmc');



var src = "./src/mt",
    dest = "./build/mt";


kmc.config({
           packages:[{
                       name: 'mt',
                       base: src
                    },
                    {
                       name: 'udata',
                       base: './'
                    }]
});

//开启静态文件服务器，当采用cmd风格模块时开启该功能可以避免每次文件改动后，都得等watch执行完后才能运行项目，提高开发效率
kmc.server({
   port:8181,//默认8080
   fixModule:false,//默认false，是否修复模块(加上模块名以及依赖，建议默认，执行效率更高)
   path: './build' // 静态文件目录，默认 './build'
});

gulp.task('kmc', function() {

     gulp.src(src+"/**/*.js")
       //转换cmd模块为kissy模块
        .pipe(kmc.convert({
            kissy: true, // modulex: true , define: true
            exclude: ['tasks'],//忽略该目录
            ignoreFiles: ['.combo.js', '-min.js'],//忽略该类文件,
            requireCss: false //是否保留js源码中的require('./xxx.css) 默认true
        }))
        //合并文件
        .pipe(kmc.combo({
             files:[{
                       src: src+'/index.js',
                       dest: dest+'/core.js'
                   }]
         }))
        .pipe(gulp.dest(dest));
        
    gulp.src("./udata/**/*.js")
            .pipe(kmc.convert({
                ignoreFiles: ['.combo.js', '-min.js']
            }))
            .pipe(kmc.combo({
                 files:[{
                           src: './udata/index.js',
                           dest: dest+'/udata/core.js'
                       }]
             }))
            .pipe(gulp.dest(dest+"/udata"));


});

gulp.task('default', ['kmc']);

```

or you can write like this if you wish

```js
gulp.src([src+"/**/*.js","./taojie/**/*.js"])
        .pipe(kmc.convert({
            exclude: ['tasks'],
            ignoreFiles: ['.combo.js', '*-min.js']
        }))
        .pipe(kmc.combo({
             files:[{
                       src: src+'/mt/index.js',
                       dest: dest+'/mt/core.js'
                   },
                   {
                      src: './taojie/index.js',
                      dest: dest+'/taojie/core.js'
                  }]
         }))
        .pipe(kmc.dest({
                "mt" :dest+"/mt", //一起打包时可以单独设置每个包的打包路径
                "udata" : dest+"/udata",
                "*": dest //其他文件打包路径
            }));
            //注意是kmc.dest 而非gulp.dest
        
```
