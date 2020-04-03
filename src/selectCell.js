import zrender from 'zrender'
import {headerHeight,indexWidth} from './config'

class SelectCell extends zrender.Rect{
    constructor(cells,data){
        let originConfig = {
            cursor:'default',
            style:{
                stroke: '#4e9fff',
                lineWidth:'2',
                fill:'none',
            },
            zlevel:999
        }
        let config = {
            shape:{

            }
        }
        //cells的长度为1的时候
        if(cells.length == 1){
           config.shape = {
               x:1 + cells[0].data.x * data.cellWidth + indexWidth,
               y:1 + cells[0].data.y * data.cellHeight + headerHeight,
               width:cells[0].data.cellWidth,
               height:cells[0].data.cellHeight
           }
        }else{
            //求最小下标以及最大下标
            let xstart = cells[0].data.x
            let ystart = cells[0].data.y
            let xend = cells[cells.length - 1].data.x
            let yend = cells[cells.length - 1].data.y
            //下标最小的是起点
            config.shape.x = 1 + xstart * data.cellWidth + indexWidth
            config.shape.y = 1 + ystart * data.cellHeight + headerHeight
            //下标最大的是终点
            shape.width = (xend - xstart + 1) * data.cellWidth
            shape.height = (yend - ystart + 1) * data.cellHeight
        }
        let finalConfig = Object.assign({},originConfig,config)
        super(finalConfig)
    }
    //改变选择框的位置和大小
    change(cells,data){
        let shape = {}
        if(cells.length == 1){
            shape = {
                x:1 + cells[0].data.x * data.cellWidth + indexWidth,
                y:1 + cells[0].data.y * data.cellHeight + headerHeight,
                width:cells[0].data.cellWidth,
                height:cells[0].data.cellHeight
            }
        }else{
            //求最小下标以及最大下标
            let xstart = cells[0].data.x
            let ystart = cells[0].data.y
            let xend = cells[cells.length - 1].data.x
            let yend = cells[cells.length - 1].data.y
            //下标最小的是起点
            shape.x = 1 + xstart * data.cellWidth + indexWidth
            shape.y = 1 + ystart * data.cellHeight + headerHeight
            //下标最大的是终点
            shape.width = (xend - xstart + 1) * data.cellWidth
            shape.height = (yend - ystart + 1) * data.cellHeight
        }
        this.attr('shape',shape)
    }
}

export default SelectCell