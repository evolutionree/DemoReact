
## 修改了第三方组件源代码的地方，npm install 后要手动修改

### `jsplumb`
由于需求要限制节点不能往上和往左拖拽出指定区域，可以往下和往右拖拽
jsplumb设定了指定区域之后，是限制上下左右都不可以拖出去

打开源码，搜索 this.params.setPosition(dragEl, cPos);
在该语句之前大约三行左右的 var rect = {x: .................}之前添加如下代码:  
if (cPos[0] < 0) {  
    cPos[0] = 0;  
}
if (cPos[1] < 0) {  
    cPos[1] = 0;  
}
