import zrender from 'zrender'
import Cell from './cell.js'
import SelectCell from './selectCell.js'
import CopyedCell from './copyedCell.js'
import TableHeaderCell from './tableHeaderCell.js'
import TableIndexCell from './tableIndexCell.js'
import {defaultTableConfig,headerHeight,indexWidth,scrollWidth} from './config'
import Scroll from './scroll.js'
import Edit from './edit.js'
import Event from "./event.js"
import ContextMenu from './contextMenu.js'
import UploadFile from './uploadFile.js'
import ToolBar from './toolBar.js'
import { mouseWheelDirection, preventDefault,stopPropagation ,generateUUID} from "./utils.js"

class DaoDaoExcel extends Event {
    constructor(obj){
        super()
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
        //当前在剪贴板中的单元格
        this.copyCells = []
        //选中的时候显示的那个蓝色框框
        this.selectedCell = null
        //copyCells有数据的那个蓝色框框
        this.copyedCell = null
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
        //工具条
        this.toolBar = null
        //默认文字状态
        this.textConfig = {
            'fontFamily':'微软雅黑',
            'fontSize':14,
            'fontStyle':'normal',
            'fontWeight':'normal',
            'textFill':'#000000',
            'fill':'#ffffff',
            'border':false,
            'textAlign':'center'
        }
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
        const canvasWrapper = document.createElement('div')
        canvasWrapper.id = generateUUID()
        canvasWrapper.style.width = parent.clientWidth + 'px'
        canvasWrapper.style.height = (parent.clientHeight - 30) + 'px'
        parent.appendChild(canvasWrapper)
       //新建canvas
       this.canvas = zrender.init(canvasWrapper);
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
       this.initScroll(canvasWrapper)
       //初始化编辑框
       this.initEdit(canvasWrapper)
       //初始化上传文件
       this.initUploadFile(parent)
       //初始化右键菜单
       this.initContextMenu(canvasWrapper)
       //初始化工具条
       this.initToolBar(parent)
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
        this.selectedCell.change(this.selectCells)
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
                this.cells[x][y] = new Cell({...{
                    x:x,
                    y:y,
                    cellWidth:this.currentObj.cellWidth,
                    cellHeight:this.currentObj.cellHeight,
                    row:1,
                    span:1,
                    merge:false,
                    text:"",
                },...this.textConfig})
                this.table.add(this.cells[x][y])
            }
        }
        this.table.on('mousedown',(event) => {
            //将工具条的状态改变得和cell的状态一致
            this.toolBar.setConfig(event.target.parent.data)
            if(event.event.button != 0){
                //如果点击的不是鼠标左键
                return false
            }
            this.emit("clickCell",{data:event.target.parent.data})
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
            let positionX = this.table.position[0]
            let positionY = this.table.position[1]
            this.selectedCell.attr('position',[positionX,positionY])
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
        getBoundXY()
        function getBoundXY(){
            for(let x = xstart;x <= xend;x++){
                for(let y = ystart;y <= yend;y++){
                    if(that.cells[x][y].data.merge == true&&that.cells[x][y].data.mergeConfig){
                        let flag = false
                        if(that.cells[x][y].data.mergeConfig.xstart < xstart){
                            xstart = that.cells[x][y].data.mergeConfig.xstart
                            flag = true
                        }
                        if(that.cells[x][y].data.mergeConfig.xend > xend){
                            xend = that.cells[x][y].data.mergeConfig.xend
                            flag = true
                        }
                        if(that.cells[x][y].data.mergeConfig.ystart < ystart){
                            ystart = that.cells[x][y].data.mergeConfig.ystart
                            flag = true
                        }
                        if(that.cells[x][y].data.mergeConfig.yend > yend){
                            yend = that.cells[x][y].data.mergeConfig.yend
                            flag = true
                        }
                        if(flag){
                            getBoundXY()
                        }
                    }
                }
            }
        }
        for(let x = xstart;x <= xend;x++){
            for(let y = ystart;y <= yend;y++){
                list.push(this.cells[x][y])
            }
        }
        return list
    }
    keydownMethod(event){
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
                        cell.clear()
                    })
                }   
                break;    
            case 67:
                //ctrl+c
                if(event.ctrlKey){
                    this.setCopyCell()
                }
                break;    
            case 86:
                //ctrl+v
                if(event.ctrlKey){
                    this.pastCopyCell()
                }
                break;        
        }
    }
    removeMethods(event){
        if(event.target != this.edit.editEle){
            this.edit.hideEdit()
        }

        if(this.handleTableMouseMove){
            this.table.off('mousemove',this.handleTableMouseMove)
        }
        if(this.handleHeaderMouseMove && this.canvas){
            this.canvas.off('mousemove',this.handleHeaderMouseMove)
        }
        if(this.handleIndexMouseMove && this.canvas){
            this.canvas.off('mousemove',this.handleIndexMouseMove)
        }
    }
    initEvents(){
        //取消绑定事件
        this.removeMethods = this.removeMethods.bind(this)
        document.addEventListener('mouseup',this.removeMethods)
        //上下左右键更改一下选中和激活的单元格
        document.addEventListener('keydown',this.keydownMethod)
    }
    setCopyCell(){
        //初始化选中的蓝色框框
        if(this.copyedCell){
            //如果有选择框了就更新位置
            this.copyedCell.change(this.selectCells)
        }else{
            //如果没有选择框就创建一个
            this.copyedCell = new CopyedCell(this.selectCells)
            this.canvas.add(this.copyedCell)
        }
        let positionX = this.table.position[0]
        let positionY = this.table.position[1]
        this.copyedCell.attr('position',[positionX,positionY])
        this.copyCells = []
        for(let i = 0;i<this.selectCells.length;i++){
            let obj = zrender.util.clone(this.selectCells[i].data)
            delete obj.cellHeight
            delete obj.cellWidth
            delete obj.xPlace
            delete obj.yPlace

            this.copyCells.push(obj)
        }
    }
    pastCopyCell(){
        if(this.copyCells.length == 0){
            return false
        }
        let copyTemp = []
        //计算copyCells有几列几行
        let copyMax = Math.max(...this.copyCells.map(item => item.x))
        let copyMin = Math.min(...this.copyCells.map(item => item.x))
        let copyYMin =  Math.min(...this.copyCells.map(item => item.y))
        let copySpan = copyMax - copyMin + 1
        let copyRow = this.copyCells.length / copySpan

        let tempSelect = []
        let selectMax = Math.max(...this.selectCells.map(item => item.data.x))
        let selectMin = Math.min(...this.selectCells.map(item => item.data.x))
        let selectYMin = Math.min(...this.selectCells.map(item => item.data.y))
        let selectYMax = Math.max(...this.selectCells.map(item => item.data.y))
        let selectSpan = selectMax - selectMin + 1
        let selectRow = this.selectCells.length / selectSpan

        //如果选择的不是复制的整数倍的话，就去掉几个格子
        if(selectRow / copyRow < 1||selectSpan / copySpan < 1){
            alert('复制粘贴的位置不够，请重新选择')
            return false
        }
       
        if(selectRow % copyRow != 0){
            selectYMax -= selectRow % copyRow
            selectRow -= selectRow % copyRow
        }
        if(selectSpan % copySpan != 0){
            selectMax -= selectSpan % copySpan
            selectSpan -= selectSpan % copySpan
        }

        this.selectCells.forEach(cell => {
            cell.unSelectCell()
        })
        this.selectCells = []
        for(let i = selectMin;i<=selectMax;i++){
            for(let j = selectYMin;j<=selectYMax;j++){
                this.selectCells.push(this.cells[i][j])
            }
        }

        for(let i = 0;i < copyRow;i++){
            copyTemp.push([])
            for(let j = 0;j<copySpan;j++){
                delete this.copyCells[j*copyRow + i].x
                delete this.copyCells[j*copyRow + i].y

                copyTemp[i].push(this.copyCells[j*copyRow + i])
            }
        }

        for(let i = 0;i < selectRow;i++){
            tempSelect.push([])
            for(let j = 0;j<selectSpan;j++){
                tempSelect[i].push(this.selectCells[j*selectRow + i])
            }
        }

        for(let i = 0;i<tempSelect.length;i++){
            for(let j = 0;j<tempSelect[i].length;j++){
                //如果这一格是合并的单元格，那重新计算一下mergeConfig
                if(copyTemp[i%copyRow][j%copySpan].merge == true && copyTemp[i%copyRow][j%copySpan].mergeConfig){
                    let disX = selectMin - copyMin
                    let disY = selectYMin - copyYMin
                    let xstart = copyTemp[i%copyRow][j%copySpan].mergeConfig.xstart;
                    let xend = copyTemp[i%copyRow][j%copySpan].mergeConfig.xend;
                    let ystart = copyTemp[i%copyRow][j%copySpan].mergeConfig.ystart;
                    let yend = copyTemp[i%copyRow][j%copySpan].mergeConfig.yend;

                    xstart += (copySpan*Math.floor(j/copySpan)+disX)
                    xend += (copySpan*Math.floor(j/copySpan)+disX)
                    ystart += (copyRow*Math.floor(i/copyRow) + disY)
                    yend += (copyRow*Math.floor(i/copyRow)+ disY)

                    let width = 0
                    let height = 0

                    for(let m = copyTemp[i%copyRow][j%copySpan].mergeConfig.xstart;m<=copyTemp[i%copyRow][j%copySpan].mergeConfig.xend;m++){
                        width += this.tableHeaderCell[m].data.width
                    }

                    for(let m = copyTemp[i%copyRow][j%copySpan].mergeConfig.ystart;m<=copyTemp[i%copyRow][j%copySpan].mergeConfig.yend;m++){
                        height += this.tableIndexCell[m].data.height
                    }

                    tempSelect[i][j].setData(copyTemp[i%copyRow][j%copySpan])
                    tempSelect[i][j].setData({
                        cellWidth:width,
                        cellHeight:height,
                        mergeConfig:{
                            xstart:xstart,
                            xend:xend,
                            ystart:ystart,
                            yend:yend
                        }
                    })
                }else{
                    tempSelect[i][j].setData(copyTemp[i%copyRow][j%copySpan])
                }
            }
        }
        this.selectCells.forEach(cell => {
            cell.selectCell()
        })
        this.activeCell.unSelectCell()
        this.copyCells = []
        this.canvas.remove(this.copyedCell)
        this.copyedCell = null
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
    initScroll(parent){
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
            parent:parent
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
            if(this.copyedCell){
                this.copyedCell.attr('position',[positionX,moveY])
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
            if(this.copyedCell){
                this.copyedCell.attr('position',[moveX,positionY])
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
                if(this.copyedCell){
                    this.copyedCell.attr('position',[positionX,moveY])
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
                if(this.copyedCell){
                    this.copyedCell.attr('position',[positionX,moveY])
                }
            }
        })
    }
    initEdit(parent){
        this.edit = new Edit(parent)
        this.edit.editEle.addEventListener('click',(e) => {
            stopPropagation(e)
        })
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
                insertArr[y] = new Cell({...{
                    x:index+1,
                    y:y,
                    cellWidth:this.currentObj.cellWidth,
                    cellHeight:this.currentObj.cellHeight,
                    row:1,
                    span:1,
                    merge:false,
                    text:""
                },...this.textConfig})
                this.table.add(insertArr[y])
            }
            this.cells.splice(index+1,0,insertArr)
            //更新所有cells的xy
            for(let x = 0;x<this.cells.length;x++){
                for(let y=0;y<this.cells[x].length;y++){
                    this.cells[x][y].setData({x:x,y:y})
                    //如果这个单元格是合并的单元格
                    if(this.cells[x][y].data.merge == true && this.cells[x][y].data.row > 1 &&this.cells[x][y].data.span > 1){
                        //如果index在merge的单元格之中
                        if(index >= this.cells[x][y].data.mergeConfig.xstart && index < this.cells[x][y].data.mergeConfig.xend){
                            this.cells[x][y].data.mergeConfig.xend += 1
                            this.cells[x][y].data.span += 1
                            for(let m = this.cells[x][y].data.mergeConfig.ystart;m<=this.cells[x][y].data.mergeConfig.yend;m++){
                                this.cells[index+1][m].setData({
                                    row:0,
                                    span:0,
                                    merge:true
                                })
                            }
                        } 
                         //如果index在merge之前
                         if(index < this.cells[x][y].data.mergeConfig.xstart){
                            this.cells[x][y].data.mergeConfig.xstart += 1
                            this.cells[x][y].data.mergeConfig.xend += 1
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
                let insert = new Cell({...{
                    x:x,
                    y:index + 1,
                    cellWidth:this.currentObj.cellWidth,
                    cellHeight:this.currentObj.cellHeight,
                    row:1,
                    span:1,
                    merge:false,
                    text:""
                },...this.textConfig})
                this.cells[x].splice(index+1,0,insert)
                this.table.add(insert)
            }
            //更新所有cells的xy
            for(let x = 0;x<this.cells.length;x++){
                for(let y=0;y<this.cells[x].length;y++){
                    this.cells[x][y].setData({x:x,y:y})
                    //如果这个单元格是合并的单元格
                    if(this.cells[x][y].data.merge == true && this.cells[x][y].data.row > 1 &&this.cells[x][y].data.span > 1){
                        //如果index在merge的单元格之中
                        if(index >= this.cells[x][y].data.mergeConfig.ystart && index < this.cells[x][y].data.mergeConfig.yend){
                            this.cells[x][y].data.mergeConfig.yend += 1
                            this.cells[x][y].data.row += 1
                            for(let m = this.cells[x][y].data.mergeConfig.xstart;m<=this.cells[x][y].data.mergeConfig.xend;m++){
                                this.cells[m][index + 1].setData({
                                    row:0,
                                    span:0,
                                    merge:true
                                })
                            }
                        } 
                        //如果index在merge之前
                        if(index < this.cells[x][y].data.mergeConfig.ystart){
                            this.cells[x][y].data.mergeConfig.ystart += 1
                            this.cells[x][y].data.mergeConfig.yend += 1
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
                cell.clear()
            })
        })

        //合并单元格
        const mergeCells = this.contextMenu.addButton('合并单元格',()=>{
           this.mergeCells()
        })

        //取消合并单元格
        const splitCell = this.contextMenu.addButton('取消合并单元格',() => {
            this.splitCell()
        })

        //删除列
        const deleteSpan = this.contextMenu.addButton('删除列',() => {
            //先把列删掉
            const index = this.activeCell.data.x
            for(let y = 0;y<this.cells[index].length;y++){
                this.table.remove(this.cells[index][y])
            }

            //更新所有cells的xy
            for(let x = 0;x<this.cells.length;x++){
                for(let y=0;y<this.cells[x].length;y++){
                    this.cells[x][y].setData({x:x,y:y})
                    //如果这个单元格是合并的单元格
                    if(this.cells[x][y].data.merge == true && this.cells[x][y].data.row > 1 &&this.cells[x][y].data.span > 1){
                        //如果index在merge的单元格之中
                        if(index >= this.cells[x][y].data.mergeConfig.xstart && index <= this.cells[x][y].data.mergeConfig.xend){
                            this.cells[x][y].data.mergeConfig.xend -= 1
                            this.cells[x][y].data.span -= 1
                            //如果被删掉的刚好是合并的，那就设置相邻的单元格顶替
                            if(index == this.cells[x][y].data.mergeConfig.xstart || index == this.cells[x][y].data.mergeConfig.xend){
                                this.cells[this.cells[x][y].data.mergeConfig.xstart + 1][y].setData({
                                    row:this.cells[x][y].data.row,
                                    span:this.cells[x][y].data.span,
                                    mergeConfig:{
                                        xstart:this.cells[x][y].data.mergeConfig.xstart,
                                        xend:this.cells[x][y].data.mergeConfig.xend,
                                        ystart:this.cells[x][y].data.mergeConfig.ystart,
                                        yend:this.cells[x][y].data.mergeConfig.yend,
                                    }
                                })
                                x++
                            }
                        } 
                         //如果index在merge之前
                         if(index < this.cells[x][y].data.mergeConfig.xstart){
                            this.cells[x][y].data.mergeConfig.xstart -= 1
                            this.cells[x][y].data.mergeConfig.xend -= 1
                        }
                    }
                }
            }

            this.cells.splice(index,1)
            //更新所有cells的xy
            for(let x = 0;x<this.cells.length;x++){
                for(let y=0;y<this.cells[x].length;y++){
                    this.cells[x][y].setData({x:x,y:y})
                }
            }
            //再删头部
            this.tableHeader.remove(this.tableHeaderCell[index])
            this.tableHeaderCell.splice(index,1)
            //更新所有tableHeaderCell的data和位置
             for(let i = index;i<this.tableHeaderCell.length;i++){
                this.tableHeaderCell[i].setData({index:i})
            }

            //更新整个视图
            this.refreshCell()
        })

        //删除行
        const deleteRow = this.contextMenu.addButton('删除行',() => {
            //先把行删掉
            const index = this.activeCell.data.y
            for(let x = 0;x<this.cells.length;x++){
                this.table.remove(this.cells[x][index])
            }

            //更新所有cells的xy
            for(let x = 0;x<this.cells.length;x++){
                for(let y=0;y<this.cells[x].length;y++){
                    this.cells[x][y].setData({x:x,y:y})
                    //如果这个单元格是合并的单元格
                    if(this.cells[x][y].data.merge == true && this.cells[x][y].data.row > 1 &&this.cells[x][y].data.span > 1){
                        //如果index在merge的单元格之中
                        if(index >= this.cells[x][y].data.mergeConfig.ystart && index <= this.cells[x][y].data.mergeConfig.yend){
                            this.cells[x][y].data.mergeConfig.yend -= 1
                            this.cells[x][y].data.row -= 1
                            //如果被删掉的刚好是合并的，那就设置相邻的单元格顶替
                            if(index == this.cells[x][y].data.mergeConfig.ystart || index == this.cells[x][y].data.mergeConfig.yend){
                                this.cells[x][this.cells[x][y].data.mergeConfig.ystart + 1].setData({
                                    row:this.cells[x][y].data.row,
                                    span:this.cells[x][y].data.span,
                                    mergeConfig:{
                                        xstart:this.cells[x][y].data.mergeConfig.xstart,
                                        xend:this.cells[x][y].data.mergeConfig.xend,
                                        ystart:this.cells[x][y].data.mergeConfig.ystart,
                                        yend:this.cells[x][y].data.mergeConfig.yend,
                                    }
                                })
                                y++
                            }
                        } 
                         //如果index在merge之前
                         if(index < this.cells[x][y].data.mergeConfig.ystart){
                            this.cells[x][y].data.mergeConfig.ystart -= 1
                            this.cells[x][y].data.mergeConfig.yend -= 1
                        }
                    }
                }
            }

            for(let x = 0;x<this.cells.length;x++){
                this.cells[x].splice(index,1)
            }
            
            //更新所有cells的xy
            for(let x = 0;x<this.cells.length;x++){
                for(let y=0;y<this.cells[x].length;y++){
                    this.cells[x][y].setData({x:x,y:y})
                }
            }
            //再删头部
            this.tableIndex.remove(this.tableIndexCell[index])
            this.tableIndexCell.splice(index,1)
            //更新所有tableHeaderCell的data和位置
             for(let i = index;i<this.tableIndexCell.length;i++){
                this.tableIndexCell[i].setData({index:i})
            }

            //更新整个视图
            this.refreshCell()
        })

        //复制
        const copy = this.contextMenu.addButton('复制',() => {
            this.setCopyCell()
        })

        //粘贴
        const paste = this.contextMenu.addButton('粘贴',() => {
            this.pastCopyCell()
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
        this.hideMenu = this.hideMenu.bind(this)
        document.addEventListener('click',this.hideMenu)
    }
    hideMenu(){
        this.contextMenu.hideMenu()
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
            this.selectCells.forEach(cell => {
                cell.selectCell()
            })
            this.activeCell.unSelectCell()
        }
        //刷新复制框
        if(this.copyedCell){
            this.copyCells = []
            this.canvas.remove(this.copyedCell)
            this.copyedCell = null
        }
        //刷新滚动条
        this.refreshScroll()
    }
    refreshTableHeaderCell(){
        let x = indexWidth
        this.tableHeaderCell.forEach(cell => {
            cell.setData({
                xPlace:x
            })
            cell.refresh()
            x += cell.data.width
        })
    }
    refreshTableIndexCell(){
        let y = headerHeight
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
    mergeCells(){
        if(this.selectCells.every(cell => {return cell.data.merge == false})){
            
        }else{
            return false
        }
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
    }
    splitCell(){
        //遍历一遍当前合并的单元格，重新设置他们的位置以及大小
        let xstart = this.selectCells[0].data.x
        let ystart = this.selectCells[0].data.y
        let xend = this.selectCells[this.selectCells.length - 1].data.x
        let yend = this.selectCells[this.selectCells.length - 1].data.y

        for(let x = xstart;x<=xend;x++){
            for(let y=ystart;y<=yend;y++){
                if(this.cells[x][y].data.merge == true && this.cells[x][y].data.row > 1 && this.cells[x][y].data.span > 1){
                    let x0 = this.cells[x][y].data.mergeConfig.xstart
                    let y0 = this.cells[x][y].data.mergeConfig.ystart
                    let x1 = this.cells[x][y].data.mergeConfig.xend
                    let y1 = this.cells[x][y].data.mergeConfig.yend
                    for(let i = x0;i<=x1;i++){
                        for(let j=y0;j<=y1;j++){
                            this.cells[i][j].setData({
                                xPlace:this.tableHeaderCell[i].data.xPlace,
                                yPlace:this.tableIndexCell[j].data.yPlace,
                                cellWidth:this.tableHeaderCell[i].data.width,
                                cellHeight:this.tableIndexCell[j].data.height,
                                merge:false,
                                row:1,
                                span:1,
                                mergeConfig:null
                            })
                            this.cells[i][j].show()
                            this.selectCells.push(this.cells[i][j])
                        }
                    }
                }
            }
        }
        this.selectedCell.change(this.selectCells)
    }
    initToolBar(parent){
        this.toolBar = new ToolBar(parent)
        this.toolBar.on('copy',(e) => {
            this.setCopyCell()
        })
        this.toolBar.on('paste',(e) => {
            this.pastCopyCell()
        })
        this.toolBar.on('clearFormat',(e) => {
            this.selectCells.forEach(cell =>{
                cell.clearFormat()
            })
        })
        this.toolBar.on('changeTypeFace',(e) => {
            //更改selectCells的fontFamily
            this.selectCells.forEach(cell => {
                cell.setFontFamily(e.data)
            })
        })
        this.toolBar.on('changeFontSize',(e) => {
            this.selectCells.forEach(cell => {
                cell.setFontSize(e.data)
            })
        })
        this.toolBar.on('changeFontWeight',(e) => {
            this.selectCells.forEach(cell => {
                cell.setFontWeight(e.data)
            })
        })
        this.toolBar.on('changeFontItalic',(e) => {
            this.selectCells.forEach(cell => {
                cell.setFontItalic(e.data)
            })
        })
        this.toolBar.on('changeTextFill',(e) => {
            this.selectCells.forEach(cell => {
                cell.setTextFill(e.data)
            })
        })
        this.toolBar.on('changeFill',(e) => {
            this.selectCells.forEach(cell => {
                cell.setFill(e.data)
            })
        })
        this.toolBar.on('changeBorder',(e) =>{
            this.selectCells.forEach(cell => {
                cell.setBorder(e.data)
            })
        })
        this.toolBar.on('changeTextAlign',(e) => {
            this.selectCells.forEach(cell => {
                cell.setTextAlign(e.data)
            })
        })
        this.toolBar.on('mergeCell',(e) => {
            this.mergeCells()
        })
        this.toolBar.on('splitCell',(e) => {
            this.splitCell()
        })
        this.toolBar.on('addImage',(e) => {
            this.uploadFile.open()
        })
    }
    //改变列数
    setSpanNum(number){
        //检测有没有这么多列，如果没有的话，就删除单元格和Header,如果没有的话就添加单元格和Header
        if(number <= this.tableHeaderCell.length){
            while(number < this.tableHeaderCell.length){
                //tableHeaderCell
                this.tableHeader.remove(this.tableHeaderCell.pop())
                //删除cells最末尾几列
                for(let i=0;i<this.cells[this.cells.length - 1].length;i++){
                    this.table.remove(this.cells[this.cells.length - 1][i])
                }
                this.cells.pop()
            }

            //重新绘制
            this.refreshCell()
        }else{
            while(number > this.tableHeaderCell.length){
                const index = this.tableHeaderCell.length
                this.addTableHeaderCell({
                    cellWidth:this.currentObj.cellWidth,
                    cellHeight:headerHeight,
                    index:index
                })
                //cells插入列
                let insertArr = new Array()
                for(let y = 0;y < this.tableIndexCell.length;y++){
                    insertArr[y] = new Cell({...{
                        x:index,
                        y:y,
                        cellWidth:this.currentObj.cellWidth,
                        cellHeight:this.currentObj.cellHeight,
                        row:1,
                        span:1,
                        merge:false,
                        text:""
                    },...this.textConfig})
                    this.table.add(insertArr[y])
                }
                this.cells.splice(index,0,insertArr)
            }
            //重新绘制
            this.refreshCell()
        }
    }
    //改变行数
    setRowNum(number){
        //检测有没有这么多行，如果没有的话，就删除单元格和Index,如果没有的话就添加单元格和Index
        if(number <= this.tableIndexCell.length){
            while(number < this.tableIndexCell.length){
                //删除tableIndexCell最末尾几个
                this.tableIndex.remove(this.tableIndexCell.pop())
                //删除cells最末尾几行
                for(let i=0;i<this.cells.length;i++){
                    this.table.remove(this.cells[i].pop())
                }
            }

            //重新绘制
            this.refreshCell()
        }else{
            while(number > this.tableIndexCell.length){
                //新增tableIndexCell
                //新增cells
                const index = this.tableIndexCell.length
                this.addTableIndexCell({
                    cellWidth:indexWidth,
                    cellHeight:this.currentObj.cellHeight,
                    index:index
                })
                //cells插入行
                for(let x = 0;x < this.cells.length;x++){
                    let insert = new Cell({...{
                        x:x,
                        y:index,
                        cellWidth:this.currentObj.cellWidth,
                        cellHeight:this.currentObj.cellHeight,
                        row:1,
                        span:1,
                        merge:false,
                        text:""
                    },...this.textConfig})
                    this.cells[x].splice(index,0,insert)
                    this.table.add(insert)
                }
            }
            //重新绘制
            this.refreshCell()
        }
    }
    //获取全部数据
    getTableDatas(){
        let data = []
        for(let i = 0;i<this.cells.length;i++){
            let arr = []
            for(let j = 0;j<this.cells[i].length;j++){
                arr.push(JSON.parse(JSON.stringify(this.cells[i][j].data)))
            }
            data.push(arr)
        }
        return data
    }
    //批量填充全部数据
    /*
    *    config = {
    *       data:Array 一维数组 或 二维数组,data中，x和y是必须的
    *       clear:Boolean 填充数据时是否清空其他数据 true:清空 false:不清空
    *    }
    */
    setTableDatas(data,clear = false){
        //先检测data的长度，看有没有data，没有的话提示一下，有的话进行下一步
        if(data){
            if(data instanceof Array){
                if(data.length > 0){
                    if(clear){
                        //先清空其他格子
                        this.cells.forEach(list => {
                            list.forEach(cell => {
                                cell.clear()
                                cell.clearFormat()
                            })
                        })
                    }
                    //判断data是一维数组还是二维数组
                    if(data[0] instanceof Array){
                        //判断data最大的x,y如果大于现在的，那就添加几行几列
                        let arr = data.flat()
                        let maxX = Math.max(...arr.map(item => item.x))
                        let maxY = Math.max(...arr.map(item => item.y))
                        if(maxX > this.tableHeaderCell.length){
                            this.setSpanNum(maxX+1)
                        }
                        if(maxY > this.tableIndexCell.length){
                            this.setRowNum(maxY+1)
                        }
                        //二维
                        for(let i = 0;i<data.length;i++){
                            for(let j = 0;j<data[i].length;j++){
                                this.cells[data[i][j].x][data[i][j].y].setData({
                                    ...this.textConfig,...data[i][j]
                                })
                            }
                        }
                    }else{
                        //判断data最大的x,y如果大于现在的，那就添加几行几列
                        let maxX = Math.max(data.map(item => item.x))
                        let maxY = Math.max(data.map(item => item.y))
                        if(maxX > this.tableHeaderCell.length){
                            this.setSpanNum(maxX)
                        }
                        if(maxY > this.tableIndexCell.length){
                            this.setRowNum(maxY)
                        }
                        //一维
                        for(let i = 0;i<data.length;i++){
                            this.cells[data[i].x][data[i].y].setData({
                                ...this.textConfig,...data[i]
                            })
                        }
                    }
                }else{
                    return false
                }
            }else{
                return false
            }
        }else{
            return false
        }
    }
    /****
     * 注销对象
     * 
     */
    dispose(){
        this.canvas.dispose()
        const parent = document.getElementById(this.currentObj.id) 
        parent.innerHTML = ""
        this.canvas = null
        this.scroll.dispose()
        document.removeEventListener('click',this.hideMenu)
        document.removeEventListener('keydown',this.keydownMethod)
        document.removeEventListener('mouseup',this.removeMethods)
        this.currentObj = null
        this.table = null
        this.cells = null
        this.activeCell = null
        this.selectCells = null
        this.copyCells = null
        this.selectedCell = null
        this.copyedCell = null
        this.tableHeader = null
        this.tableHeaderCell = null
        this.tableIndex = null
        this.tableIndexCell = null
        this.selectAllCell = null
        this.edit = null
        this.contextMenu = null
        this.changeWidthLine = null
        this.uploadFile = null
        this.toolBar = null
        this.textConfig = null
    }
}

window.DaoDaoExcel = DaoDaoExcel 

export default DaoDaoExcel
