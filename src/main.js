import zrender from 'zrender'
import Cell from './cell.js'
import SelectCell from './selectCell.js'

class DaoDaoExcel {
    constructor(obj){
        //默认配置
        const defaultObj = {
            cellWidth:100,
            cellHeight:30,
            row:10,
            span:8
        }
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
       //绑定事件
       this.initEvents()
    }
    initCells(){
        //table是一个group,里面装着cells
        this.table = new zrender.Group()
        this.canvas.add(this.table)
        for(let x = 0;x < this.currentObj.span;x++){
            this.cells[x] = new Array()
            //由于zrender的Rect描边粗细有bug，所以我的做法是先放大两倍然后再缩放0.5倍
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
            this.selectCells.forEach(cell => {
                cell.unSelectCell()
            })
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
            this.table.on('mousemove',this.handleMouseMove,this)
        })
        document.addEventListener('mouseup',() => {
            this.table.off('mousemove',this.handleMouseMove)
        })
    }
    handleMouseMove(event){
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

        this.selectCells.forEach(cell => {
            cell.unSelectCell()
        })
        this.selectCells = []
        for(let i = xstart;i<=xend;i++){
            for(let j=ystart;j<=yend;j++){
                this.selectCells.push(this.cells[i][j])
            }
        }
        this.selectCells.forEach(cell => {
            cell.selectCell()
        })
        this.selectedCell.change(this.selectCells,{
            cellWidth:this.currentObj.cellWidth,
            cellHeight:this.currentObj.cellHeight
        })
        this.activeCell.unSelectCell()
    }
    initEvents(){
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
            this.selectCells.forEach(cell => {
                cell.unSelectCell()
            })
            this.selectCells = [this.activeCell]
            this.selectedCell.change(this.selectCells,{
                cellWidth:this.currentObj.cellWidth,
                cellHeight:this.currentObj.cellHeight
            })
        })
    }
}

window.DaoDaoExcel = DaoDaoExcel 

export default DaoDaoExcel
