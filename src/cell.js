import zrender from 'zrender'

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
        let xPlace = 1 + data.cellWidth * data.x  * 2
        let yPlace = 1 + data.cellHeight * data.y * 2
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
    }
    selectCell(){
        this.attr({style:{fill:'rgba(1,136,251,0.1)'}})
    }
    unSelectCell(){
        this.attr({style:{fill:'#fff'}})
    }

}

export default Cell