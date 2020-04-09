import zrender from 'zrender'
import {headerHeight,indexWidth} from './config'

class SelectCell extends zrender.Rect{
    constructor(cells){
        let originConfig = {
            cursor:'default',
            style:{
                stroke: '#4e9fff',
                lineWidth:'2',
                fill:'none',
            },
            z:999
        }
        let config = {
            shape:{

            }
        }
        //cells的长度为1的时候
        if(cells.length == 1){
           config.shape = {
               x:cells[0].data.xPlace,
               y:cells[0].data.yPlace,
               width:cells[0].data.cellWidth,
               height:cells[0].data.cellHeight
           }
        }else{
            let x = cells[0].data.xPlace
            let y = cells[0].data.yPlace
            let width = cells[cells.length - 1].data.xPlace + cells[cells.length - 1].data.cellWidth - x 
            let height = cells[cells.length - 1].data.yPlace + cells[cells.length - 1].data.cellHeight - y

            //下标最小的是起点
            config.shape.x = x
            config.shape.y = y
            //下标最大的是终点
            config.shape.width = width
            config.shape.height = height
        }
        let finalConfig = Object.assign({},originConfig,config)
        super(finalConfig)
    }
    //改变选择框的位置和大小
    change(cells){
        let shape = {}
        if(cells.length == 1){
            shape = {
                x:cells[0].data.xPlace,
                y:cells[0].data.yPlace,
                width:cells[0].data.cellWidth,
                height:cells[0].data.cellHeight
            }
        }else{
            //求最小下标以及最大下标
            let x = cells[0].data.xPlace
            let y = cells[0].data.yPlace
            let width = cells[cells.length - 1].data.xPlace + cells[cells.length - 1].data.cellWidth - x 
            let height = cells[cells.length - 1].data.yPlace + cells[cells.length - 1].data.cellHeight - y

            //下标最小的是起点
            shape.x = x
            shape.y = y
            //下标最大的是终点
            shape.width = width
            shape.height = height
        }
        this.attr('shape',shape)
    }
}

export default SelectCell