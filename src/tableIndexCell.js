import zrender from 'zrender'
import {headerHeight} from './config.js'
import { mouseWheelDirection, preventDefault,stopPropagation } from "./utils.js"

class TableHeaderCell extends zrender.Group{
    constructor(config){
        let defaultConfig = {
            cursor:'default',
            scale:[0.5,0.5]
        }
        //由于zrender的Rect描边粗细有bug，所以我的做法是先放大两倍然后再缩放0.5倍
        let xPlace = 0
        let yPlace = config.cellHeight * config.index + headerHeight  
        let countConfig = {
            shape:{
                x:1,
                y:1,
                width:config.cellWidth * 2,
                height:config.cellHeight * 2
            },
            style:{
                text:config.index + 1,
                stroke: '#aaa',
                fill: 'white',
                lineWidth:'1'
            },
            z:1
        }
        let finnalconfig = Object.assign({},defaultConfig,config,countConfig)
        super({position:[xPlace,yPlace],z:1000})
        this.box = new zrender.Rect(finnalconfig)
        this.box.type = 'indexBorder'
        this.add(this.box)
        this.line = new zrender.Line({
            shape:{
                x1:0,
                y1:config.cellHeight,
                x2:config.cellWidth,
                y2:config.cellHeight
            },
            cursor:'ns-resize',
            style:{
                stroke: '#aaa',
                opacity:0,
                fill: 'white',
                lineWidth:'6',
            },
            z:2
        })
        this.add(this.line)
        this.type = 'tableHeaderCell'
        this.handlers = {}
        this.isDrag = false
        this.data = {
            index:config.index,
            height:config.cellHeight,
            yPlace:yPlace
        }
        this.type = 'tableIndexCell'
        this.line.on('mousedown',(event) => {
            stopPropagation(event.event)
            let height = event.offsetY - this.data.yPlace - this.parent.position[1]
            this.emit('dragLine',{height:height,offsetY:event.offsetY})
            this.isDrag = true
            this.mousemove = this.mousemove.bind(this)
            document.addEventListener('mousemove',this.mousemove)
        })
        document.addEventListener('mouseup',(event) => {
            if(this.isDrag){
                this.data.height = event.offsetY - this.data.yPlace - this.parent.position[1]
                let offsetY = event.offsetY
                if(this.data.height < 10){
                    this.data.height = 10
                    offsetY = this.data.yPlace + 10
                }else{
                    offsetY = event.offsetY
                }
                this.emit('changeSize',{height:this.data.height,offsetY:offsetY})
            }
            this.isDrag = false
            document.removeEventListener('mousemove',this.mousemove)
        })
    }
    mousemove(event){
        let height = event.offsetY - this.data.yPlace - this.parent.position[1]
        let offsetY = event.offsetY
        if(height < 10){
            height = 10
            offsetY = this.data.yPlace + 10
        }else{
            offsetY = event.offsetY
        }
        this.emit('dragLine',{height:height,offsetY:offsetY})
    }
    selectCell(){
        this.box.attr({style:{fill:'rgb(160,212,255)'}})
    }
    unSelectCell(){
        this.box.attr({style:{fill:'#fff'}})
    }
    addEvent(type,handler){
        if(typeof this.handlers[type] === "undefined"){
            this.handlers[type] = []
        }
        this.handlers[type].push(handler)
    }
    emit(type,event){
        if(!event.target){
            event.target = this
        }
        if(this.handlers[type] instanceof Array){
            const handlers = this.handlers[type]
            handlers.forEach((handler)=>{
                handler(event)
            })
        }
    }
    remove(type,handler){
        if(this.handlers[type] instanceof Array){
            const handlers = this.handlers[type]
            for(var i = 0,len = handlers.length; i < len; i++){
                if(handlers[i] === handler){
                    break;
                }
            }
            handlers.splice(i,1)
        }
    }
    refresh(){
        this.attr('position',[0,this.data.yPlace])
        //画格子
        this.box.attr({
            shape:{
                height:this.data.height * 2
            }
        })
        //画线线
        this.line.attr({
            shape:{
                y1:this.data.height,
                y2:this.data.height
            }
        })
    }
    setData(data){
        this.data = Object.assign({},this.data,data)
    }
}

export default TableHeaderCell