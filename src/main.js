import zrender from 'zrender'
import Cell from './cell.js'
import SelectCell from './selectCell.js'
import TableHeaderCell from './tableHeaderCell.js'
import TableIndexCell from './tableIndexCell.js'
import {defaultTableConfig,headerHeight,indexWidth,scrollWidth} from './config'
import Scroll from './scroll.js'
import { mouseWheelDirection } from "./utils.js"

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
            zlevel:1001
        })
        //初始化滚动条
        this.initScroll()
        this.canvas.add(this.selectAllCell)
       //绑定事件
       this.initEvents()
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
                    cellHeight:this.currentObj.cellHeight
                })
                this.table.add(this.cells[x][y])
            }
        }
        this.table.on('mousedown',(event) => {
            this.cancelSelectCell()
            //设置选中单元格为当前单击的单元格
            this.selectCells = [event.target]
            //设置激活的单元格尾当前单击的单元格
            this.activeCell = event.target
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
            this.table.on('mousemove',this.handleTableMouseMove,this)
        })
    }
    handleTableMouseMove(event){
        //计算当前拖动到的单元格的下标
        const x = event.target.data.x
        const y = event.target.data.y
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
        this.selectCells = []
        for(let i = xstart;i<=xend;i++){
            for(let j=ystart;j<=yend;j++){
                this.selectCells.push(this.cells[i][j])
            }
        }
        this.updateSelectState()
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
            if (event.preventDefault){
                event.preventDefault();
            }else{
                event.returnValue=false;
            }
            const keyCode = event.keyCode || event.which
            //获取到activeCell的下标
            if(!this.activeCell){
                return false
            }
            let x = this.activeCell.data.x
            let y = this.activeCell.data.y
            switch(keyCode){
                case 38:
                    //上
                    //如果y = 0,就阻止，否则 y - 1
                    if(y > 0){
                        y -= 1
                    }
                    break;
                case 40:
                    //下
                    if(y < this.currentObj.row - 1){
                        y += 1
                    }
                    break;    
                case 37:
                    //左
                    if(x > 0){
                        x -= 1
                    }
                    break;  
                case 39:
                    //右
                    if(x < this.currentObj.span - 1){
                        x += 1
                    }
                    break;      
            }
            this.activeCell = this.cells[x][y]
            this.cancelSelectCell()
            this.selectCells = [this.activeCell]
            this.selectedCell.change(this.selectCells,{
                cellWidth:this.currentObj.cellWidth,
                cellHeight:this.currentObj.cellHeight
            })
        })
    }
    initTableHeader(){
        this.tableHeader = new zrender.Group()
        this.canvas.add(this.tableHeader)
        for(let i = 0;i<this.currentObj.span;i++){
            let headCell = new TableHeaderCell({
                cellWidth:this.currentObj.cellWidth,
                cellHeight:headerHeight,
                index:i
            })
            this.tableHeaderCell.push(headCell)
            this.tableHeader.add(headCell)
        }
        this.tableHeader.on('mousedown',(event) => {
            this.cancelSelectCell()
            //选中的是哪一列
            let index = event.target.data.index
            this.selectCells = []
            console.log(this.cells)
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
                case 'tableHeaderCell':
                    targetIndex = event.target.data.index
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
                case 'cell':
                    targetIndex = event.target.data.x
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
    initTableIndex(){
        this.tableIndex = new zrender.Group()
        this.canvas.add(this.tableIndex)
        for(let i = 0;i < this.currentObj.row;i++){
            let indexCell = new TableIndexCell({
                cellWidth:indexWidth,
                cellHeight:this.currentObj.cellHeight,
                index:i
            })
            this.tableIndexCell.push(indexCell)
            this.tableIndex.add(indexCell)
        }
        this.tableIndex.on('mousedown',(event) => {
            this.cancelSelectCell()
            //选中的是哪一行
            let index = event.target.data.index
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
                case 'tableIndexCell':
                    targetIndex = event.target.data.index
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
                case 'cell':
                    targetIndex = event.target.data.y
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
            let positionX = this.table.position[0]
            let moveY = e.pageMove
            if(moveY > 0){
                moveY = 0
            }
            if(moveY < -(tableHeight - tableWrapperHeight + scrollWidth)){
                moveY = -(tableHeight - tableWrapperHeight + scrollWidth)
            }
            this.table.attr('position',[positionX, moveY])
            let positionIndexX = this.tableIndex.position[0]
            this.tableIndex.attr('position',[positionIndexX,moveY])
            if(this.selectedCell){
                 this.selectedCell.attr('position',[positionX,moveY])
            }
        })
        this.scroll.on('scrollX',(e) => {
            let positionY = this.table.position[1]
            let moveX = e.pageMove
            if(moveX > 0){
                moveX = 0
            }
            if(moveX < -(tableWidth - tableWrapperWidth + scrollWidth)){
                moveX = -(tableWidth - tableWrapperWidth + scrollWidth)
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
            if(tableHeight < tableWrapperHeight){
                return false
            }
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
                if(moveY < -(tableHeight - tableWrapperHeight + scrollWidth)){
                    moveY = -(tableHeight - tableWrapperHeight + scrollWidth)
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
}

window.DaoDaoExcel = DaoDaoExcel 

export default DaoDaoExcel
