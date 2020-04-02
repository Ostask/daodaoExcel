import zrender from 'zrender'
import {headerHeight,indexWidth} from './config'

class Cell extends zrender.Rect{
    constructor(data,config){
        let defaultConfig = {
            cursor:'default',
            scale:[0.5,0.5],
            style:{
                stroke: '#aaa',
                fill: 'white',
                lineWidth:'1'
            }
        }
        //由于zrender的Rect描边粗细有bug，所以我的做法是先放大两倍然后再缩放0.5倍
        let xPlace = 1 + data.cellWidth * data.x  * 2 + indexWidth * 2
        let yPlace = 1 + data.cellHeight * data.y * 2 + headerHeight * 2
        let countConfig = {
            shape:{
                x:xPlace,
                y:yPlace,
                width:data.cellWidth * 2,
                height:data.cellHeight * 2
            }
        }
        let finnalconfig = Object.assign({},defaultConfig,config,countConfig)
        super(finnalconfig)
        this.data = data
        this.type = 'cell'
    }
    selectCell(){
        this.attr({style:{fill:'rgba(1,136,251,0.1)'}})
    }
    unSelectCell(){
        this.attr({style:{fill:'#fff'}})
    }

}

export default Cell