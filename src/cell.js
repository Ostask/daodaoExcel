import zrender from 'zrender'
import {headerHeight,indexWidth} from './config'
import data from "./test.js"

class Cell extends zrender.Group{
    constructor(data,config){
        let defaultCellConfig = {
            cursor:'default',
            scale:[0.5,0.5],
            style:{
                stroke: '#aaa',
                fill: 'white',
                lineWidth:'1',
                fontSize:14,
            },
            z:1
        }
        //由于zrender的Rect描边粗细有bug，所以我的做法是先放大两倍然后再缩放0.5倍
        let xPlace =  data.cellWidth * data.x + indexWidth
        let yPlace =  data.cellHeight * data.y + headerHeight
        let countConfig = {
            shape:{
                x:1,
                y:1,
                width:data.cellWidth * 2,
                height:data.cellHeight * 2
            }
        }
        let finnalconfig = Object.assign({},defaultCellConfig,config,countConfig)
        super({
            position:[xPlace,yPlace]
        })
        this.data = Object.assign({},data,{
            xPlace:xPlace,
            yPlace:yPlace
        })
        this.type = 'cell'
        this.cell = null
        this.init(finnalconfig)
    }
    //初始化单元格
    init(finnalconfig){
        this.cell = new zrender.Rect(finnalconfig)
        this.cell.type = 'cellborder'
        this.add(this.cell)
    }
    //设置选中单元格样式
    selectCell(){
        this.cell.attr({style:{fill:'rgba(1,136,251,0.1)'}})
    }
    //取消选择样式重置
    unSelectCell(){
        this.cell.attr({style:{fill:'#fff'}})
    }
    //设置单元格文字
    setText(text){
        this.cell.attr({style:{text:text}})
        this.data.text = text
    }
    //设置单元格data
    setData(data){
        this.data = Object.assign({},this.data,data)
        //更改cell的大小
        this.cell.attr({shape:{
            width:this.data.cellWidth * 2,
            height:this.data.cellHeight * 2
        }})
        //更改cell的显示隐藏
        if(this.data.merge == true && (this.data.row == 0 || this.data.span == 0)){
            this.hide()
        }else{
            this.show()
        }
        this.attr('position',[this.data.xPlace,this.data.yPlace])
    }
}

export default Cell