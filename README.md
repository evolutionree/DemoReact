## 修改了第三方组件源代码的地方，npm install 后要手动修改

### `jsplumb`

> 由于需求要限制节点不能往上和往左拖拽出指定区域，可以往下和往右拖拽
jsplumb设定了指定区域之后，是限制上下左右都不可以拖出去

修改的文件路径：node_modules/jsplumb/dist/js/jsplumb.js  

搜索 this.params.setPosition(dragEl, cPos);  
在该语句之前大约三行左右的 var rect = {x: .................}之前添加如下代码:   

```
if (cPos[0] < 0) {  
    cPos[0] = 0;  
}
if (cPos[1] < 0) {  
    cPos[1] = 0;  
}
```

### `npm run build`

> 好像升级roadhog版本为1.1.1之后没有打包内存不够的问题，如果打包有报内存问题请做以下处理

修改的文件路径：node_modules\roadhog\bin\roadhog.js

将：  
```
[require.resolve(`../lib/${script}`)].concat(args),
```
替换为：  
```
['--max_old_space_size=4096', require.resolve(`../lib/${script}`)].concat(args),
```

### `开启打包后的js和css文件加hash功能`

> 概述：基于版本原因roadhog的1.x和2.x版本区别很大，只能暂时使用1.1.1的roadhog版本，请先阅读两个roadhog官方GitHub的Issues: [单入口添加hash](https://github.com/sorrycc/roadhog/issues/386)和[多入口添加hash](https://github.com/sorrycc/roadhog/issues/520)。

> 要求：`入口文件名称必须和public里面对应的的.html文件名称一致`，因为该版本roadhog不支持多入口工程打包完成后修改对应入口.html文件里面的link和script标签，默认打包完成后会把所有的link和script全加到index.html文件里面。所以end-build.js脚本作用就是把index.html里面多余的link和script标签加到对应入口的.html文件里面。

注意问题：  
1. Issue里面的多入口添加hash方法需要修改源代码，所以并没有采用该做法。另写了个`end-build.js`脚本处理打包后dist文件里面的.html文件。
2. 注意开发环境和生产环境的区别，该版本的roadhog只要 `src/index.ejs` 和 `hash: true`就会开启 HTMLWebpackPlugin。开发的时候不需要开启打包后js和css文件加hash功能，所以开发的时候src里面不可以有index.ejs模版文件。所以就有另外一个脚本`pre-build.js`.

如果要打包后的css和js不需要加后缀：  
1. 设置 `.roadhogrc` 的属性 `"hash": false,`,或者直接删该属性
2. 修改package.json脚本，去掉build脚本的钩子，也就是删了`prebuild`和`postbuild`这两个脚本属性，并且要确保src文件下没有index.ejs模版文件
