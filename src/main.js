import zrender from 'zrender'
import Cell from './cell.js'
import SelectCell from './selectCell.js'
import TableHeaderCell from './tableHeaderCell.js'
import TableIndexCell from './tableIndexCell.js'
import {defaultTableConfig,headerHeight,indexWidth,scrollWidth} from './config'
import Scroll from './scroll.js'
import Edit from './edit.js'
import ContextMenu from './contextMenu.js'
import UploadFile from './uploadFile.js'
import { mouseWheelDirection, preventDefault,stopPropagation } from "./utils.js"

class DaoDaoExcel {
    constructor(obj){
        //默认配置
        const defaultObj = defaultTableConfig
        this.currentObj = {...defaultObj,...obj}
        //zrender实例
        this.canvas = null
        //整个表格的group
        this.table = null
        //所有单元格
        this.cells = new Array()
        //当前激活的单元格
        this.activeCell = null
        //当前选中的单元格
        this.selectCells = []
        //选中的时候显示的那个蓝色框框
        this.selectedCell = null
        //表头a-z
        this.tableHeader = null
        //表头a-z单元格
        this.tableHeaderCell = []
        //列头1-n
        this.tableIndex = null
        //列头1-n的单元格
        this.tableIndexCell = []
        //左上角的那个什么也没有的格子
        this.selectAllCell = null
        //可编辑的div
        this.edit = null
        //右键菜单
        this.contextMenu = null
        //改变宽度的控制柄
        this.changeWidthLine = null
        //上传图片的组件
        this.uploadFile = null
        this.init()
    }
    init(){
        //parent是canvas的包裹元素
       const parent = document.getElementById(this.currentObj.id) 
       if(!parent){
           //如果没有包裹元素就不在执行，并抛出错误
           //JavaScript引擎一旦遇到throw语句，就会停止执行后面的语句，并将throw语句的参数值，返回给用户。
           throw new Error("没有找到id为"+this.currentObj.id+"的元素!");
        }
       //新建canvas
       this.canvas = zrender.init(parent);
       this.initCells()
       this.initTableHeader()
       this.initTableIndex()
       //左上角加上一个单元格
        this.selectAllCell = new zrender.Rect({
            cursor:'default',
            scale:[0.5,0.5],
            style:{
                stroke: '#aaa',
                fill: 'white',
                lineWidth:'1'
            },
            shape:{
                x:1,
                y:1,
                width:indexWidth * 2,
                height:headerHeight * 2
            },
            z:1001
        })
        this.canvas.add(this.selectAllCell)
       //初始化滚动条
       this.initScroll()
       //初始化编辑框
       this.initEdit(parent)
       //初始化上传文件
       this.initUploadFile(parent)
       //初始化右键菜单
       this.initContextMenu(parent)
       //绑定事件
       this.initEvents()
    }
    initUploadFile(parent){
        this.uploadFile = new UploadFile(parent)
        this.uploadFile.on('changeImage',(event) => {
            this.activeCell.addImage(event.url)
        })
    }
    //取消选择单元格
    cancelSelectCell(){
        this.selectCells.forEach(cell => {
            cell.unSelectCell()
        })
        this.tableHeaderCell.forEach(cell => {
            cell.unSelectCell()
        })
        this.tableIndexCell.forEach(cell => {
            cell.unSelectCell()
        })
    }
    //更新选择状态
    updateSelectState(){
        this.selectCells.forEach(cell => {
            cell.selectCell()
        })
        this.selectedCell.change(this.selectCells,{
            cellWidth:this.currentObj.cellWidth,
            cellHeight:this.currentObj.cellHeight
        })
        this.activeCell.unSelectCell()
        this.changeHeaderAndIndexState(this.selectCells)
    }
    initCells(){
        //table是一个group,里面装着cells
        this.table = new zrender.Group()
        this.canvas.add(this.table)
        for(let x = 0;x < this.currentObj.span;x++){
            this.cells[x] = new Array()
            for(let y = 0;y < this.currentObj.row;y++){
                this.cells[x][y] = new Cell({
                    x:x,
                    y:y,
                    cellWidth:this.currentObj.cellWidth,
                    cellHeight:this.currentObj.cellHeight,
                    row:1,
                    span:1,
                    merge:false,
                    text:""
                })
                this.table.add(this.cells[x][y])
            }
        }
        this.table.on('mousedown',(event) => {
            if(event.event.button != 0){
                //如果点击的不是鼠标左键
                return false
            }
            //隐藏输入框
            this.edit.hideEdit()
            this.cancelSelectCell()
            //设置选中单元格为当前单击的单元格
            this.selectCells = [event.target.parent]
            //设置激活的单元格尾当前单击的单元格
            this.activeCell = event.target.parent
            //初始化选中的蓝色框框
            if(this.selectedCell){
                //如果有选择框了就更新位置
                this.selectedCell.change(this.selectCells)
            }else{
                //如果没有选择框就创建一个
                this.selectedCell = new SelectCell(this.selectCells)
                this.canvas.add(this.selectedCell)
            }
            //更新一下列和行的选择状态
            this.changeHeaderAndIndexState(this.selectCells)
            this.table.on('mousemove',this.handleTableMouseMove,this)
        })
        //鼠标双击进入编辑模式
        this.table.on("dblclick",(event) => {
            //计算可编辑div的位置
            let x = event.target.parent.data.x
            let y = event.target.parent.data.y
            let width = event.target.parent.data.cellWidth
            let height = event.target.parent.data.cellHeight
            //得到x方向和y方向的位移
            let movex = this.table.position[0]
            let movey = this.table.position[1]
            let positionX = event.target.parent.data.xPlace + movex
            let positionY = event.target.parent.data.yPlace + movey
            let data = event.target.parent.data.text
            //改变编辑框的状态
            this.edit.setPosition(width,height,positionX,positionY,data)
        })
    }
    handleTableMouseMove(event){
        //计算当前拖动到的单元格的下标
        const x = event.target.parent.data.x
        const y = event.target.parent.data.y
        //根据activeCell和当前的下标，动态的改变selectCells
        const ax = this.activeCell.data.x
        const ay = this.activeCell.data.y

        if(ax == x && ay == y){
            return false
        }

        let xstart
        let ystart
        let xend
        let yend

        //判断两种下标的大小，来判定到底是从哪边拖动的
        if(x > ax){
            xstart = ax
            xend = x
        }else{
            xstart = x
            xend = ax
        }

        if(y > ay){
            ystart = ay
            yend = y
        }else{
            ystart = y
            yend = ay
        }

        this.cancelSelectCell()
        
        this.selectCells = this.countSelect(xstart,xend,ystart,yend)
        
        this.updateSelectState()
    }
    countSelect(xs,xe,ys,ye){
        let xstart = xs
        let xend = xe
        let ystart = ys
        let yend = ye
        let that = this
        let list = []
        for(let x = xstart;x <= xend;x++){
            for(let y = ystart;y <= yend;y++){
                list.push(this.cells[x][y])
            }
        }
        return list
    }
    initEvents(){
        //取消绑定事件
        document.addEventListener('mouseup',() => {
            if(this.handleTableMouseMove){
                this.table.off('mousemove',this.handleTableMouseMove)
            }
            if(this.handleHeaderMouseMove){
                this.canvas.off('mousemove',this.handleHeaderMouseMove)
            }
            if(this.handleIndexMouseMove){
                this.canvas.off('mousemove',this.handleIndexMouseMove)
            }
        })
        //上下左右键更改一下选中和激活的单元格
        document.addEventListener('keydown',(event) => {
            const keyCode = event.keyCode || event.which
            //获取到activeCell的下标
            if(!this.activeCell){
                return false
            }
            let x = this.activeCell.data.x
            let y = this.activeCell.data.y
            switch(keyCode){
                case 38:
                    preventDefault(event)
                    //上
                    //如果y = 0,就阻止，否则 y - 1
                    if(y > 0){
                        y -= 1
                        this.edit.hideEdit()

                        this.activeCell = this.cells[x][y]
                        this.cancelSelectCell()
                        this.selectCells = [this.activeCell]
                        this.selectedCell.change(this.selectCells,{
                            cellWidth:this.currentObj.cellWidth,
                            cellHeight:this.currentObj.cellHeight
                        })
                    }
                    break;
                case 40:
                    //下
                    preventDefault(event)
                    if(y < this.currentObj.row - 1){
                        y += 1
                        this.edit.hideEdit()

                        this.activeCell = this.cells[x][y]
                        this.cancelSelectCell()
                        this.selectCells = [this.activeCell]
                        this.selectedCell.change(this.selectCells,{
                            cellWidth:this.currentObj.cellWidth,
                            cellHeight:this.currentObj.cellHeight
                        })
                    }
                    break;    
                case 37:
                    //左
                    preventDefault(event)
                    if(x > 0){
                        x -= 1
                        this.edit.hideEdit()

                        this.activeCell = this.cells[x][y]
                        this.cancelSelectCell()
                        this.selectCells = [this.activeCell]
                        this.selectedCell.change(this.selectCells,{
                            cellWidth:this.currentObj.cellWidth,
                            cellHeight:this.currentObj.cellHeight
                        })
                    }
                    break;  
                case 39:
                    //右
                    preventDefault(event)
                    if(x < this.currentObj.span - 1){
                        x += 1
                        this.edit.hideEdit()

                        this.activeCell = this.cells[x][y]
                        this.cancelSelectCell()
                        this.selectCells = [this.activeCell]
                        this.selectedCell.change(this.selectCells,{
                            cellWidth:this.currentObj.cellWidth,
                            cellHeight:this.currentObj.cellHeight
                        })
                    }
                    break;  
                case 13:
                    //回车
                    this.edit.hideEdit()
                    break;     
                case 8:
                case 46:    
                    //删除
                    if(!this.edit.editFlag){
                        this.selectCells.forEach(cell => {
                            cell.setText("")
                        })
                    }   
                    break;    
            }
        })
    }
    addTableHeaderCell(config){
        let headCell = new TableHeaderCell(config)
        this.tableHeaderCell.splice(config.index,0,headCell)
        this.tableHeader.add(headCell)
        headCell.addEvent('dragLine',(event)=>{
            if(this.changeWidthLine){
                this.changeWidthLine.attr({shape:{
                    x1:event.offsetX,
                    y1:0,
                    x2:event.offsetX,
                    y2:this.canvas.getHeight()
                }})
            }else{
                this.changeWidthLine = new zrender.Line({
                    z:1001,
                    shape:{
                        x1:event.offsetX,
                        y1:0,
                        x2:event.offsetX,
                        y2:this.canvas.getHeight()
                    },
                    style:{
                        stroke: '#4e9fff',
                        fill: 'none',
                        lineWidth:'1',
                    }
                })
                this.canvas.add(this.changeWidthLine)
            }
        })
        headCell.addEvent('changeSize',(event) => {
            this.canvas.remove(this.changeWidthLine)
            this.changeWidthLine = null
            this.refreshCell()
        })
    }
    initTableHeader(){
        this.tableHeader = new zrender.Group()
        this.canvas.add(this.tableHeader)
        for(let i = 0;i<this.currentObj.span;i++){
            this.addTableHeaderCell({
                cellWidth:this.currentObj.cellWidth,
                cellHeight:headerHeight,
                index:i
            })
        }
        this.tableHeader.on('mousedown',(event) => {
            //隐藏编辑框
            this.edit.hideEdit()
            if(event.target.type != 'headerBorder'){
                return false
            }
            this.cancelSelectCell()
            //选中的是哪一列
            let index = event.target.parent.data.index
            this.selectCells = []
            //更新activeCell和selectCells
            for(let x = 0;x < this.cells.length;x++){
                if(x == index){
                    this.selectCells = this.cells[x]
                } 
            }
            //选择列头 以及 单元格
             //设置激活的单元格尾当前单击的单元格
             this.activeCell = this.selectCells[0]
             this.selectCells.forEach(cell => {
                 cell.selectCell()
             })
             this.activeCell.unSelectCell()
             //初始化选中的蓝色框框
             if(this.selectedCell){
                 //如果有选择框了就更新位置
                 this.selectedCell.change(this.selectCells,{
                     cellWidth:this.currentObj.cellWidth,
                     cellHeight:this.currentObj.cellHeight
                 })
             }else{
                 //如果没有选择框就创建一个
                 this.selectedCell = new SelectCell(this.selectCells,{
                     cellWidth:this.currentObj.cellWidth,
                     cellHeight:this.currentObj.cellHeight
                 })
                 this.canvas.add(this.selectedCell)
             }
             //更新一下列和行的选择状态
             this.changeHeaderAndIndexState(this.selectCells)

             //绑定鼠标移动事件
             this.canvas.on('mousemove',this.handleHeaderMouseMove,this)
        })
    }
    handleHeaderMouseMove(event){
        if(event.target){
            let targetIndex
            let activeIndex
            let start
            let end
            switch (event.target.type){
                case 'headerBorder':
                    targetIndex = event.target.parent.data.index
                    activeIndex = this.activeCell.data.x
                    if(targetIndex != activeIndex){
                        this.cancelSelectCell()
                        this.selectCells = []
                        if(targetIndex > activeIndex){
                            start = activeIndex
                            end = targetIndex
                        }else{
                            start = targetIndex
                            end = activeIndex
                        }
                        for(let x = start;x <= end;x++){
                            this.selectCells.push(...this.cells[x])
                        }
                        this.updateSelectState()
                    }
                    break;
                case 'cellborder':
                    targetIndex = event.target.parent.data.x
                    activeIndex = this.activeCell.data.x
                    if(targetIndex != activeIndex){
                        this.cancelSelectCell()
                        this.selectCells = []
                        if(targetIndex > activeIndex){
                            start = activeIndex
                            end = targetIndex
                        }else{
                            start = targetIndex
                            end = activeIndex
                        }
                        for(let x = start;x <= end;x++){
                            this.selectCells.push(...this.cells[x])
                        }
                        this.updateSelectState()
                    }
                    break;    
            }
        }
    }
    addTableIndexCell(config){
        let indexCell = new TableIndexCell(config)
        this.tableIndexCell.splice(config.index,0,indexCell)
        this.tableIndex.add(indexCell)

        indexCell.addEvent('dragLine',(event)=>{
            if(this.changeWidthLine){
                this.changeWidthLine.attr({shape:{
                    x1:0,
                    y1:event.offsetY,
                    x2:this.canvas.getWidth(),
                    y2:event.offsetY
                }})
            }else{
                this.changeWidthLine = new zrender.Line({
                    z:1001,
                    shape:{
                        x1:0,
                        y1:event.offsetY,
                        x2:this.canvas.getWidth(),
                        y2:event.offsetY
                    },
                    style:{
                        stroke: '#4e9fff',
                        fill: 'none',
                        lineWidth:'1',
                    }
                })
                this.canvas.add(this.changeWidthLine)
            }
        })
        indexCell.addEvent('changeSize',(event) => {
            this.canvas.remove(this.changeWidthLine)
            this.changeWidthLine = null
            this.refreshCell()
        })
    }
    initTableIndex(){
        this.tableIndex = new zrender.Group()
        this.canvas.add(this.tableIndex)
        for(let i = 0;i < this.currentObj.row;i++){
            this.addTableIndexCell({
                cellWidth:indexWidth,
                cellHeight:this.currentObj.cellHeight,
                index:i
            })
        }
        this.tableIndex.on('mousedown',(event) => {
            //隐藏编辑框
            this.edit.hideEdit()
            if(event.target.type != 'indexBorder'){
                return false
            }
            this.cancelSelectCell()
            //选中的是哪一行
            let index = event.target.parent.data.index
            this.selectCells = []
            //更新activeCell和selectCells
            for(let x = 0;x < this.cells.length;x++){
                for(let y = 0;y < this.cells[x].length;y++){
                    if(y == index){
                        this.selectCells.push(this.cells[x][y])
                    }
                }
            }
            //选择列头 以及 单元格
             //设置激活的单元格尾当前单击的单元格
             this.activeCell = this.selectCells[0]
             this.selectCells.forEach(cell => {
                 cell.selectCell()
             })
             this.activeCell.unSelectCell()
             //初始化选中的蓝色框框
             if(this.selectedCell){
                 //如果有选择框了就更新位置
                 this.selectedCell.change(this.selectCells,{
                     cellWidth:this.currentObj.cellWidth,
                     cellHeight:this.currentObj.cellHeight
                 })
             }else{
                 //如果没有选择框就创建一个
                 this.selectedCell = new SelectCell(this.selectCells,{
                     cellWidth:this.currentObj.cellWidth,
                     cellHeight:this.currentObj.cellHeight
                 })
                 this.canvas.add(this.selectedCell)
             }
             //更新一下列和行的选择状态
             this.changeHeaderAndIndexState(this.selectCells)

             //绑定鼠标移动事件
             this.canvas.on('mousemove',this.handleIndexMouseMove,this)
        })
    }
    handleIndexMouseMove(event){
        if(event.target){
            let targetIndex
            let activeIndex
            let start
            let end
            switch (event.target.type){
                case 'indexBorder':
                    targetIndex = event.target.parent.data.index
                    activeIndex = this.activeCell.data.y
                    if(targetIndex != activeIndex){
                        this.cancelSelectCell()
                        this.selectCells = []
                        if(targetIndex > activeIndex){
                            start = activeIndex
                            end = targetIndex
                        }else{
                            start = targetIndex
                            end = activeIndex
                        }
                        for(let x = 0; x < this.cells.length;x++){
                            for(let y = start;y<=end;y++){
                                this.selectCells.push(this.cells[x][y])
                            }
                        }
                        this.updateSelectState()
                    }
                    break;
                case 'cellborder':
                    targetIndex = event.target.parent.data.y
                    activeIndex = this.activeCell.data.y
                    if(targetIndex != activeIndex){
                        this.cancelSelectCell()
                        this.selectCells = []
                        if(targetIndex > activeIndex){
                            start = activeIndex
                            end = targetIndex
                        }else{
                            start = targetIndex
                            end = activeIndex
                        }
                        for(let x = 0; x < this.cells.length;x++){
                            for(let y = start;y<=end;y++){
                                this.selectCells.push(this.cells[x][y])
                            }
                        }
                        this.updateSelectState()
                    }
                    break;    
            }
        }
    }
    changeHeaderAndIndexState(cells){
        if(cells.length == 1){
            this.tableHeaderCell[cells[0].data.x].selectCell()
            this.tableIndexCell[cells[0].data.y].selectCell()
        }else{
            //计算应该选择的行开始和结束位置
            let xstart = cells[0].data.x
            let ystart = cells[0].data.y
            let xend = cells[cells.length - 1].data.x
            let yend = cells[cells.length - 1].data.y
            for(let i = xstart;i <= xend;i++){
                this.tableHeaderCell[i].selectCell()
            }
            for(let i = ystart;i <= yend;i++){
                this.tableIndexCell[i].selectCell()
            }
        }
    }
    //初始化滚动条
    initScroll(){
        //计算纵向的高度
        const tableHeight = this.table.getBoundingRect().height
        //计算纵向显示高度
        const tableWrapperHeight = this.canvas.getHeight() - headerHeight
        //计算横向的宽度
        const tableWidth = this.table.getBoundingRect().width
        //计算横向显示宽度
        const tableWrapperWidth = this.canvas.getWidth() - indexWidth
        
        this.scroll = new Scroll({
            fullHeight:tableHeight,
            wrapHeight:tableWrapperHeight,
            fullWidth:tableWidth,
            wrapWidth:tableWrapperWidth,
            wrapperId:this.currentObj.id
        })
        this.scroll.on('scrollY',(e) => {
            //隐藏编辑框
            this.edit.hideEdit()
            let positionX = this.table.position[0]
            let moveY = e.pageMove
            if(moveY > 0){
                moveY = 0
            }
            if(moveY < -(this.scroll.config.fullHeight - this.scroll.config.wrapHeight + scrollWidth)){
                moveY = -(this.scroll.config.fullHeight - this.scroll.config.wrapHeight + scrollWidth)
            }
            this.table.attr('position',[positionX, moveY])
            let positionIndexX = this.tableIndex.position[0]
            this.tableIndex.attr('position',[positionIndexX,moveY])
            if(this.selectedCell){
                 this.selectedCell.attr('position',[positionX,moveY])
            }
        })
        this.scroll.on('scrollX',(e) => {
            //隐藏编辑框
            this.edit.hideEdit()
            let positionY = this.table.position[1]
            let moveX = e.pageMove
            if(moveX > 0){
                moveX = 0
            }
            if(moveX < -(this.scroll.config.fullWidth - this.scroll.config.wrapWidth + scrollWidth)){
                moveX = -(this.scroll.config.fullWidth - this.scroll.config.wrapWidth + scrollWidth)
            }
            this.table.attr('position',[moveX, positionY])
            let positionHeaderY = this.tableHeader.position[1]
            this.tableHeader.attr('position',[moveX, positionHeaderY])
            if(this.selectedCell){
                 this.selectedCell.attr('position',[moveX, positionY])
            }
        })
        this.canvas.on('mousewheel',(event) => {
            //判断需不需要滚动
            if(this.scroll.config.fullHeight < this.scroll.config.wrapHeight){
                return false
            }
            //隐藏编辑框
            this.edit.hideEdit()
            if(mouseWheelDirection(event.event)){
                //table滚动
                //index滚动
                let positionX = this.table.position[0]
                let positionY = this.table.position[1]
                let moveY = positionY + 20
                if(moveY > 0){
                    moveY = 0
                }
                this.scroll.scrollY(moveY)
                this.table.attr('position',[positionX, moveY])
                let positionIndexX = this.tableIndex.position[0]
                this.tableIndex.attr('position',[positionIndexX,moveY])
                if(this.selectedCell){
                     this.selectedCell.attr('position',[positionX,moveY])
                }
                //更新滚动条位置                
            }else{
                let positionX = this.table.position[0]
                let positionY = this.table.position[1]
                let moveY = positionY - 20
                if(moveY < -(this.scroll.config.fullHeight - this.scroll.config.wrapHeight + scrollWidth)){
                    moveY = -(this.scroll.config.fullHeight - this.scroll.config.wrapHeight + scrollWidth)
                }
                this.scroll.scrollY(moveY)
                this.table.attr('position',[positionX,moveY])
                let positionIndexX = this.tableIndex.position[0]
                this.tableIndex.attr('position',[positionIndexX,moveY])
                if(this.selectedCell){
                    this.selectedCell.attr('position',[positionX,moveY])
                }
            }
        })
    }
    initEdit(parent){
        this.edit = new Edit(parent)
        this.edit.on('update',(event) => {
            if(event.type == 'text'){
                this.activeCell.setText(event.text)
            }
        })
    }
    initContextMenu(parent){
        this.contextMenu = new ContextMenu(parent)
        //添加菜单

        const addSpan = this.contextMenu.addButton('插入列',()=>{
            //tableHeaderCell插入列
            const index = this.activeCell.data.x
            this.addTableHeaderCell({
                cellWidth:this.currentObj.cellWidth,
                cellHeight:headerHeight,
                index:index + 1
            })
            //更新所有tableHeaderCell的data和位置
            for(let i = index;i<this.tableHeaderCell.length;i++){
                this.tableHeaderCell[i].setData({index:i})
            }
            //cells插入列
            let insertArr = new Array()
            for(let y = 0;y < this.tableIndexCell.length;y++){
                insertArr[y] = new Cell({
                    x:index+1,
                    y:y,
                    cellWidth:this.currentObj.cellWidth,
                    cellHeight:this.currentObj.cellHeight,
                    row:1,
                    span:1,
                    merge:false,
                    text:""
                })
                this.table.add(insertArr[y])
            }
            this.cells.splice(index+1,0,insertArr)
            //更新所有cells的xy
            for(let x = index;x<this.cells.length;x++){
                for(let y=0;y<this.cells[x].length;y++){
                    this.cells[x][y].setData({x:x,y:y})
                    //如果这个单元格是合并的单元格
                    if(this.cells[x][y].data.merge == true && this.cells[x][y].data.row > 1 &&this.cells[x][y].data.span > 1){
                        //如果index在merge的单元格之中
                        if(index >= this.cells[x][y].data.mergeConfig.xstart && index < this.cells[x][y].data.mergeConfig.xend){
                            this.cells[x][y].data.mergeConfig.xend += 1
                        } 
                         //如果index在merge之前
                         if(index < this.cells[x][y].data.mergeConfig.xstart){
                            this.cells[x][y].data.mergeConfig.xstart += 1
                            this.cells[x][y].data.mergeConfig.xend += 1
                        }
                    }
                    //如果左右都是row=0,span=0,则被合并
                    if(x > 0 && x < this.cells.length - 1){
                        if(this.cells[x-1][y].data.merge && this.cells[x+1][y].data.merge){
                            this.cells[x][y].setData({
                                row:0,
                                span:0,
                                merge:true
                            })
                        }
                    }
                }
            }
            //更新整个视图
            this.refreshCell()
        })

        const addRow = this.contextMenu.addButton('插入行',()=>{
            //tableHeaderCell插入列
            const index = this.activeCell.data.y
            this.addTableIndexCell({
                cellWidth:indexWidth,
                cellHeight:this.currentObj.cellHeight,
                index:index + 1
            })
            //更新所有tableHeaderCell的data和位置
            for(let i = index;i<this.tableIndexCell.length;i++){
                this.tableIndexCell[i].setData({index:i})
            }
            //cells插入行
            for(let x = 0;x < this.cells.length;x++){
                let insert = new Cell({
                    x:x,
                    y:index + 1,
                    cellWidth:this.currentObj.cellWidth,
                    cellHeight:this.currentObj.cellHeight,
                    row:1,
                    span:1,
                    merge:false,
                    text:""
                })
                this.cells[x].splice(index+1,0,insert)
                this.table.add(insert)
            }
            //更新所有cells的xy
            for(let x = 0;x<this.cells.length;x++){
                for(let y=index;y<this.cells[x].length;y++){
                    this.cells[x][y].setData({x:x,y:y})
                    //如果这个单元格是合并的单元格
                    if(this.cells[x][y].data.merge == true && this.cells[x][y].data.row > 1 &&this.cells[x][y].data.span > 1){
                        //如果index在merge的单元格之中
                        if(index >= this.cells[x][y].data.mergeConfig.ystart && index < this.cells[x][y].data.mergeConfig.yend){
                            this.cells[x][y].data.mergeConfig.yend += 1
                        } 
                        //如果index在merge之前
                        if(index < this.cells[x][y].data.mergeConfig.ystart){
                            this.cells[x][y].data.mergeConfig.ystart += 1
                            this.cells[x][y].data.mergeConfig.yend += 1
                        }
                    }
                    //如果左右都是row=0,span=0,则被合并
                    if(y > 0 && y < this.cells[x].length - 1){
                        if(this.cells[x][y-1].data.merge && this.cells[x][y+1].data.merge){
                            this.cells[x][y].setData({
                                row:0,
                                span:0,
                                merge:true
                            })
                        }
                    }
                }
            }
            //更新整个视图
            this.refreshCell()
        })

        const addImage = this.contextMenu.addButton('插入图片',()=>{
            this.uploadFile.open()
        })

        const clearInputBtn = this.contextMenu.addButton('清除内容',() => {
            this.selectCells.forEach(cell => {
                cell.setText("")
                cell.removeImage()
            })
        })

        //合并单元格
        const mergeCells = this.contextMenu.addButton('合并单元格',()=>{
            //设置activeCell的row和span
            //求最小下标以及最大下标
            let xstart = this.selectCells[0].data.x
            let ystart = this.selectCells[0].data.y
            let xPlace = this.selectCells[0].data.xPlace
            let yPlace = this.selectCells[0].data.yPlace
            let xend = this.selectCells[this.selectCells.length - 1].data.x
            let yend = this.selectCells[this.selectCells.length - 1].data.y
            
            let row = yend - ystart + 1
            let span = xend - xstart + 1

            let width = 0
            let height = 0

            for(let i = xstart;i<=xend;i++){
                width += this.tableHeaderCell[i].data.width
            }

            for(let i = ystart;i<=yend;i++){
                height += this.tableIndexCell[i].data.height
            }

            this.activeCell.setData({
                row:row,
                span:span,
                merge:true,
                cellWidth:width,
                cellHeight:height,
                xPlace:xPlace,
                yPlace:yPlace,
                mergeConfig:{
                    xstart:xstart,
                    ystart:ystart,
                    xend:xend,
                    yend:yend
                }
            })

            console.log(this.activeCell)
        
            //其余的selectCells全部隐藏不显示，被merge
            this.selectCells.forEach(cell => {
                if(cell != this.activeCell){
                    cell.setData({
                        row:0,
                        span:0,
                        merge:true,
                    })
                }
            })

            //重新设置activeCell和selectCells
            this.selectCells = [this.activeCell]
        })

        //取消合并单元格
        const splitCell = this.contextMenu.addButton('取消合并单元格',() => {
            //遍历一遍当前合并的单元格，重新设置他们的位置以及大小
            let xstart = this.activeCell.data.mergeConfig.xstart
            let ystart = this.activeCell.data.mergeConfig.ystart
            let xend = this.activeCell.data.mergeConfig.xend
            let yend = this.activeCell.data.mergeConfig.yend

            this.selectCells = []

            for(let x = xstart;x<=xend;x++){
                for(let y=ystart;y<=yend;y++){
                    this.cells[x][y].setData({
                        xPlace:this.tableHeaderCell[x].data.xPlace,
                        yPlace:this.tableIndexCell[y].data.yPlace,
                        cellWidth:this.tableHeaderCell[x].data.width,
                        cellHeight:this.tableIndexCell[y].data.height,
                        merge:false,
                        row:1,
                        span:1,
                        mergeConfig:null
                    })
                    this.cells[x][y].show()
                    this.selectCells.push(this.cells[x][y])
                }
            }
            this.selectedCell.change(this.selectCells)
        })

        //右键菜单
        this.canvas.on("contextmenu",(event) => {
            preventDefault(event.event)
            //判断当前点的cell有没有在selectCells里面
            if(event.target.parent && event.target.parent.type == 'cell'){
                if(this.selectCells.includes(event.target.parent)){
                    
                }else{
                    this.edit.hideEdit()
                    this.cancelSelectCell()
                    this.activeCell = event.target.parent
                    this.selectCells = [event.target.parent]
                    if(this.selectedCell){
                        //如果有选择框了就更新位置
                        this.selectedCell.change(this.selectCells,{
                            cellWidth:this.currentObj.cellWidth,
                            cellHeight:this.currentObj.cellHeight
                        })
                    }else{
                        //如果没有选择框就创建一个
                        this.selectedCell = new SelectCell(this.selectCells,{
                            cellWidth:this.currentObj.cellWidth,
                            cellHeight:this.currentObj.cellHeight
                        })
                        this.canvas.add(this.selectedCell)
                    }
                    //更新一下列和行的选择状态
                    this.changeHeaderAndIndexState(this.selectCells)
                }
                //判断选中了几个单元格，如果选中了多个就显示合并单元格按钮
                if(this.selectCells.length > 1){
                    addImage.style.display='none'
                    if(this.selectCells.every(cell => {return cell.data.merge == false})){
                        mergeCells.style.display = "block"
                        splitCell.style.display = "none"
                    }else{
                        mergeCells.style.display = "none"
                        splitCell.style.display = "block"
                    }
                }else{
                    mergeCells.style.display = "none"
                    addImage.style.display='block'
                    if(this.selectCells[0].data.merge == true){
                        splitCell.style.display = "block"
                    }else{
                        splitCell.style.display = "none"
                    }
                }
            }
            //如果有就直接弹出menu
            //如果没有就重新设置一下selectCells以及activeCell
            this.contextMenu.showMenu(event.offsetX,event.offsetY)
        })
        document.addEventListener('click',()=>{
            this.contextMenu.hideMenu()
        })
    }
    //重新绘制cell
    refreshCell(){
        //重绘headerCell
        this.refreshTableHeaderCell()
        //重绘indexCell
        this.refreshTableIndexCell()
        //重绘tableCell
        this.refreshTableCell()
        //刷新选择框
        if(this.selectCells.length > 0){
            this.selectedCell.change(this.selectCells)
        }
        //刷新滚动条
        this.refreshScroll()
        console.log(this.cells)
    }
    refreshTableHeaderCell(){
        let x = this.tableHeaderCell[0].data.xPlace
        this.tableHeaderCell.forEach(cell => {
            cell.setData({
                xPlace:x
            })
            cell.refresh()
            x += cell.data.width
        })
    }
    refreshTableIndexCell(){
        let y = this.tableIndexCell[0].data.yPlace
        this.tableIndexCell.forEach(cell => {
            cell.setData({
                yPlace:y
            })
            cell.refresh()
            y += cell.data.height
        })
    }
    refreshTableCell(){
        for(let x = 0;x<this.cells.length;x++){
            for(let y = 0;y<this.cells[x].length;y++){
                if(this.cells[x][y].data.merge == true && this.cells[x][y].data.row != 0 && this.cells[x][y].data.span !=0){
                    //这个是合并过的单元格
                    let xstart = this.cells[x][y].data.mergeConfig.xstart
                    let ystart = this.cells[x][y].data.mergeConfig.ystart
                    let xend = this.cells[x][y].data.mergeConfig.xend
                    let yend = this.cells[x][y].data.mergeConfig.yend

                    let xPlace = this.tableHeaderCell[xstart].data.xPlace
                    let yPlace = this.tableIndexCell[ystart].data.yPlace
                    let cellWidth = 0
                    let cellHeight = 0
                    for(let i = xstart;i<=xend;i++){
                        cellWidth += this.tableHeaderCell[i].data.width
                    }
        
                    for(let i = ystart;i<=yend;i++){
                        cellHeight += this.tableIndexCell[i].data.height
                    }
                    this.cells[x][y].setData({
                        xPlace:xPlace,
                        yPlace:yPlace,
                        cellWidth:cellWidth,
                        cellHeight:cellHeight
                    })
                }else{
                    let xPlace = this.tableHeaderCell[x].data.xPlace
                    let yPlace = this.tableIndexCell[y].data.yPlace
                    let cellWidth = this.tableHeaderCell[x].data.width
                    let cellHeight = this.tableIndexCell[y].data.height
                    this.cells[x][y].setData({
                        xPlace:xPlace,
                        yPlace:yPlace,
                        cellWidth:cellWidth,
                        cellHeight:cellHeight
                    })
                }
            }
        }
    }
    refreshScroll(){
        //计算纵向的高度
        const tableHeight = this.table.getBoundingRect().height
        //计算纵向显示高度
        const tableWrapperHeight = this.canvas.getHeight() - headerHeight
        //计算横向的宽度
        const tableWidth = this.table.getBoundingRect().width
        //计算横向显示宽度
        const tableWrapperWidth = this.canvas.getWidth() - indexWidth
        let data = {
            fullHeight:tableHeight,
            wrapHeight:tableWrapperHeight,
            fullWidth:tableWidth,
            wrapWidth:tableWrapperWidth,
        }
        this.scroll.refresh(data)
    }
}

window.DaoDaoExcel = DaoDaoExcel 

export default DaoDaoExcel
