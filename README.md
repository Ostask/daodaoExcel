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
    
##### 1.excel.cells[x][y].data
        该单元格的数据以及格式

| 属性        |  默认值 |  类型  | 含义                               |
| ----------  | ------ |------  |---------------------------------- |
| name        |(根据位置改变)| String |单元格的名字| 
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
| x           |(根据位置改变)| Number  |单元格所在的横向的坐标 ,坐标从零开始              |
| xPlace      |(根据位置改变)| Number  |单元格左上角的像素坐标          |
| y           |(根据位置改变)| Number  |单元格所在的纵向的坐标 ，坐标从零开始              |
| yPlace      |(根据位置改变)| Number  |单元格左上角的像素坐标          |
| ltIcon      |"none"  | String  |单元格左上角的图标 ，注：有五个默认的图标 "upArrow","downArrow","leftArrow","rightArrow","filter",暂时不支持别的图标，有需求联系作者         |
| lbIcon      |"none"  | String  |单元格左下角的图标 ，注：有五个默认的图标 "upArrow","downArrow","leftArrow","rightArrow","filter",暂时不支持别的图标，有需求联系作者         |
| rtIcon      |"none"  | String  |单元格右上角的图标 ，注：有五个默认的图标 "upArrow","downArrow","leftArrow","rightArrow","filter",暂时不支持别的图标，有需求联系作者         |
| rbIcon      |"none"  | String  |单元格右下角的图标 ，注：有五个默认的图标 "upArrow","downArrow","leftArrow","rightArrow","filter",暂时不支持别的图标，有需求联系作者         |


##### 2.其它属性
    参考zrender的Elements属性

#### excel.activeCell
    当前激活的单元格

#### excel.selectCells
    当前选中的单元格

#### excel.copyCells
    当前复制在剪贴板中的数据

#### excel.tableHeaderCell
    最顶端A-Z的表头        

##### 1.excel.tableHeaderCell.data
        该表头的数据以及格式

| 属性        |  默认值       |  类型  | 含义                               |
| ----------  | ------       |------  |---------------------------------- |
| index       | (根据位置改变)| Number |表头顺序                                | 
| width       | 100          | Number |表头宽度                          |
| xPlace      | (根据位置改变)| Number |表头像素位置                        |

#### excel.tableIndexCell
    表格最左的列头      

##### 1. excel.tableIndexCell.data
        该列头的数据以及格式

| 属性        |  默认值       |  类型  | 含义                               |
| ----------  | ------       |------  |---------------------------------- |
| index       | (根据位置改变)| Number |列头顺序                                | 
| height      | 30           | Number |列头高度                          |
| yPlace      | (根据位置改变)| Number |列头像素位置                        |

#### excel.edit
    编辑框对象

##### 1. excel.edit.editEle
    编辑框DOM

#### excel.contextMenu
    右键菜单对象

##### 1. excel.contextMenu.menuEl    
    右键菜单的DOM对象
##### 2. excel.contextMenu.menus
    右键菜单按钮列表      

#### excel.uploadFile
    上传图片的对象

#### excel.toolBar
    工具条对象

##### 1. excel.toolBar.el
    工具条DOM

##### 2. excel.toolBar.parent
    工具条父元素DOM

##### 3. excel.toolBar.copyButton
    复制按钮
       
##### 4. excel.toolBar.pasteButton
    粘贴按钮

##### 5. excel.toolBar.clearFormat
    清除按钮

##### 6. excel.toolBar.typeFaceButton
    选择字体按钮

##### 7. excel.toolBar.fontSizeButton
    字体大小按钮
        
##### 8. excel.toolBar.fontWeightButton
    加粗按钮

##### 9. excel.toolBar.fontItalicButton
    斜体按钮

##### 10. excel.toolBar.textFillButton
    文字颜色按钮
        
##### 11. excel.toolBar.fillButton
    背景颜色按钮

##### 12. excel.toolBar.borderButton
    边框按钮

##### 13. excel.toolBar.alignLiftButton
    左对齐按钮
        
##### 14. excel.toolBar.alignRightButton
    右对齐按钮

##### 15. excel.toolBar.alignCenterButton
    居中对齐按钮

##### 16. excel.toolBar.mergeCellButton
    合并单元格按钮

##### 17. excel.toolBar.splitCellButton
    拆分单元格按钮

##### 18. excel.toolBar.addImageButton
    添加图片按钮


### 实例方法（实例使用 excel 命名）
   #### 1. excel.refreshCell()
        刷新视图
   #### 2. excel.getTableDatas()
        获取全部数据

   #### 3. excel.setTableDatas(config)
        批量填入数据
        config:
| 属性        |  默认值       |  类型  | 含义                               |
| ----------  | ------       |------  |---------------------------------- |
| data        | 必填          | Array | 一维数组 或 二维数组,data中，x和y是必须的,其它属性参考 excel.cells[x][y].data | 
| clear       | false         | Boolean |填充数据时是否清空其他数据 true:清空 false:不清空                         |

   #### 4. excel.cells[x][y].setData(data)
        修改单元格数据，data格式见上面 cells.data

   #### 5. excel.cells[x][y].clear()
        清除单元格数据，不清除格式

   #### 6. excel.cells[x][y].clearFormat()
        清除单元格格式，不清除数据          

   #### 5. excel.setSpanNum(number)
        修改excel的列数   
        
   #### 6. excel.setRowNum(number)
        修改excel的行数     

   #### 7. 获取某个单元格数据
         这个功能我没有写。。大家可以用  excel.cells 的data (hhh,我是懒鬼，反正没人用，那我就怎么开心怎么来啦)    

   #### 8. excel.dispose()
        移除自身。当不再需要使用该实例时，调用该方法以释放内存。

### 事件
  
   #### 1.单元格点击事件
   clickCell事件

   例：
```js
    excel.on("clickCell",(data) =>{
        console.log(data)
    })

```   