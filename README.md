# daodaoExcel
    基于canvas的和js开发的类excel表格，支持用户自定义添加工具栏以及右键菜单

## 基本使用

### 初始化
    引入daodaoExcel dist目录中的js文件
    在使用 ZRender 前需要初始化实例，具体方式是传入一个对象，对象的id属性为dom的id
    示例：
```html
        <div id="daodao" style="width:1000px;height:600px;"></div>
        <script src="daodaoExcel.js"></script>
        <script>
            var excel = new DaoDaoExcel({id:'daodao'})
        </script>
```

### 实例属性（实例使用 excel 命名）
#### excel.cells
     该excel中所有的单元格
    
    1.excel.cells.data
        该单元格的数据以及格式

| 属性        |  默认值 |  类型  | 含义                               |
| ----------  | ------ |------  |---------------------------------- |
| border      | false  | Boolean |是否有边框，true:有边框。false：无边框| 
| cellHeight  | 30     | Number  |单元格高度                          |
| cellWidth   | 100    | Number  |单元格宽度                          |
| fill        | #ffffff| String  |单元格颜色                          |
| fontFamily  | 微软雅黑| String  |单元格字体                         |
| fontSize    | 14     | Number  |字体大小                           |
| fontStyle   | normal | String  |字体样式，同css的fontStyle          |
| fontWeight  | normal |String   |字体粗细, 同css的fontWeight         |
| merge       | false  |Boolean  |该单元格是否被合并，true:被合并, false:没有合并,注：如果merge为true，且mergeConfig为null,span为0，row为0的时候,该单元格不会显示出来|
| row         | 1      | Number  |单元格占几行,注：单独设置row不会起作用,还要设置cellWidth,以及merge,mergeConfig,不建议自己改这个值                       |
| span        | 1      | Number  |单元格占几列，注：单独设置span不会起作用，还要设置cellHeight,以及merge,mergeConfig，不建议自己改这个值                   |
| text        | ""     | String  |单元格的文字                       |
| textAlign   |center  | String  |单元格的文字对齐方式（center,left,right）|
| textFill    |#000000 | String  |单元格文字的颜色                    |
| x           | /      | 