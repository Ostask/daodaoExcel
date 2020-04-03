import zrender from 'zrender'
import {headerHeight} from './config.js'

class TableHeaderCell extends zrender.Rect{
    constructor(config){
        let defaultConfig = {
            cursor:'default',
            scale:[0.5,0.5]
        }
        //由于zrender的Rect描边粗细有bug，所以我的做法是先放大两倍然后再缩放0.5倍
        let xPlace = 1
        let yPlace = 1 + config.cellHeight * config.index * 2 + headerHeight * 2 
        let countConfig = {
            shape:{
                x:xPlace,
                y:yPlace,
                width:config.cellWidth * 2,
                height:config.cellHeight * 2
            },
            style:{
                text:config.index + 1,
                stroke: '#aaa',
                fill: 'white',
                lineWidth:'1'
            },
            zlevel:1000
        }
        let finnalconfig = Object.assign({},defaultConfig,config,countConfig)
        super(finnalconfig)
        this.data = {
            index:config.index
        }
        this.type = 'tableIndexCell'
    }
    selectCell(){
        this.attr({style:{fill:'rgb(160,212,255)'}})
    }
    unSelectCell(){
        this.attr({style:{fill:'#fff'}})
    }
}

export default TableHeaderCell