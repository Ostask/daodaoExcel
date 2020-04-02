import zrender from 'zrender'
import {letter,indexWidth} from './config.js'

class TableHeaderCell extends zrender.Rect{
    constructor(config){
        let defaultConfig = {
            cursor:'default',
            scale:[0.5,0.5]
        }
        //由于zrender的Rect描边粗细有bug，所以我的做法是先放大两倍然后再缩放0.5倍
        let xPlace = 1 + config.cellWidth * config.index  * 2 + indexWidth * 2
        let yPlace = 1 
        let countConfig = {
            shape:{
                x:xPlace,
                y:yPlace,
                width:config.cellWidth * 2,
                height:config.cellHeight * 2
            },
            style:{
                text:letter[config.index],
                stroke: '#aaa',
                fill: 'white',
                lineWidth:'1'
            }
        }
        let finnalconfig = Object.assign({},defaultConfig,config,countConfig)
        super(finnalconfig)
        this.data = {
            index:config.index
        }
        this.type = 'tableHeaderCell'
    }
    selectCell(){
        this.attr({style:{fill:'rgba(1,136,251,0.1)'}})
    }
    unSelectCell(){
        this.attr({style:{fill:'#fff'}})
    }
}

export default TableHeaderCell