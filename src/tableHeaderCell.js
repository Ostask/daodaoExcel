import zrender from 'zrender'
import {letter,indexWidth} from './config.js'
import { mouseWheelDirection, preventDefault,stopPropagation,generateCode } from "./utils.js"

class TableHeaderCell extends zrender.Group{
    constructor(config){
        let defaultConfig = {
            cursor:'default',
            scale:[0.5,0.5]
        }
        //由于zrender的Rect描边粗细有bug，所以我的做法是先放大两倍然后再缩放0.5倍
        let xPlace =  config.cellWidth * config.index + indexWidth
        let yPlace =  0 
        let countConfig = {
            shape:{
                x:1,
                y:1,
                width:config.cellWidth * 2,
                height:config.cellHeight * 2
            },
            style:{
                text:generateCode(config.index),
                stroke: '#aaa',
                fill: 'white',
                lineWidth:'1',
            },
            z:10
        }
        let finnalconfig = Object.assign({},defaultConfig,config,countConfig)
        super({position:[xPlace,yPlace],z:1000})
        this.data = {
            index:config.index,
            width:config.cellWidth,
            xPlace:xPlace
        }
        this.box = new zrender.Rect(finnalconfig)
        this.box.type = 'headerBorder'
        this.add(this.box)
        this.line = new zrender.Line({
            shape:{
                x1:config.cellWidth,
                y1:0,
                x2:config.cellWidth,
                y2:config.cellHeight
            },
            cursor:'ew-resize',
            style:{
                stroke: '#fff',
                opacity:0,
                fill: 'white',
                lineWidth:'6',
            },
            z:11
        })
        this.add(this.line)
        this.type = 'tableHeaderCell'
        this.handlers = {}
        this.isDrag = false
        this.line.on('mousedown',(event) => {
            stopPropagation(event.event)
             let width = event.offsetX - this.data.xPlace - this.parent.position[0]
            this.emit('dragLine',{width:width,offsetX:event.offsetX})
            this.isDrag = true
            this.mousemove = this.mousemove.bind(this)
            document.addEventListener('mousemove',this.mousemove)
            this.mouseup = this.mouseup.bind(this)
            document.addEventListener('mouseup',this.mouseup)
        })
    }
    mouseup(event){
        if(this.isDrag){
            this.data.width = event.offsetX - this.data.xPlace - this.parent.position[0]
            let offsetX = event.offsetX
            if(this.data.width < 10){
                this.data.width = 10
                offsetX = this.data.xPlace + 10
            }else{
                offsetX = event.offsetX
            }
            this.emit('changeSize',{width:this.data.width,offsetX:offsetX})
        }
        this.isDrag = false
        document.removeEventListener('mousemove',this.mousemove)
        document.removeEventListener('mouseup',this.mouseup)
    }
    mousemove(event){
        let width = event.offsetX - this.data.xPlace - this.parent.position[0]
        let offsetX = event.offsetX
        if(width < 10){
            width = 10
            offsetX = this.data.xPlace + 10
        }else{
            offsetX = event.offsetX
        }
        this.emit('dragLine',{width:width,offsetX:offsetX})
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
        this.attr('position',[this.data.xPlace,0])
        //画格子
        this.box.attr({
            shape:{
                width:this.data.width * 2
            }
        })
        //画线线
        this.line.attr({
            shape:{
                x1:this.data.width,
                x2:this.data.width
            }
        })
    }
    setData(data){
        this.data = Object.assign({},this.data,data)
        this.box.attr({style:{
            text:generateCode(this.data.index)
        }})
    }
}

export default TableHeaderCell