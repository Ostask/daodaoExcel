import zrender from 'zrender'
import {headerHeight,indexWidth} from './config'
import  icons  from './icon'

class Cell extends zrender.Group{
    constructor(data){
        let defaultCellConfig = {
            cursor:'default',
            scale:[0.5,0.5],
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
            },
            style:{
                stroke: '#aaa',
                fill: 'white',
                lineWidth:'1',
                fontSize:data.fontSize,
                fontFamily:data.fontFamily,
                fontWeight:data.fontWeight,
                fontStyle:data.fontStyle,
                textFill:data.textFill,
                fill:data.fill,
                textAlign:'center',
                textPosition:'inside',
                textOffset:[0,0]
            }
        }
        let finnalconfig = Object.assign({},defaultCellConfig,countConfig)
        super({
            position:[xPlace,yPlace]
        })
        this.data = Object.assign({},data,{
            xPlace:xPlace,
            yPlace:yPlace,
        })
        this.type = 'cell'
        this.img = null
        this.ltIcon = null
        this.rtIcon = null
        this.lbIcon = null
        this.rbIcon = null
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
        let color = 'rgba(1,136,251,0.1)'
        let datafill = this.data.fill
        let newColor = zrender.color.lerp(0.8, [color,datafill],true)
        
        this.cell.attr({style:{fill:newColor.color}})
    }
    //取消选择样式重置
    unSelectCell(){
        this.cell.attr({style:{fill:this.data.fill}})
    }
    //设置单元格文字
    setText(text){
        this.cell.attr({style:{text:text}})
        this.data.text = text
    }
    //设置字体
    setFontFamily(font){
        this.cell.attr({style:{fontFamily:font}})
        this.data.fontFamily = font
    }
    //设置字体大小
    setFontSize(size){
        this.cell.attr({style:{fontSize:size}})
        this.data.fontSize = size
    }
    //设置文字粗细
    setFontWeight(data){
        this.cell.attr({style:{fontWeight:data}})
        this.data.fontWeight = data
    }
    //设置文字倾斜
    setFontItalic(data){
        this.cell.attr({style:{fontStyle:data}})
        this.data.fontStyle = data
    }
    //设置字体颜色
    setTextFill(data){
        this.cell.attr({style:{textFill:data}})
        this.data.textFill = data
    }
    //设置背景颜色
    setFill(data){
        this.cell.attr({style:{fill:data}})
        this.data.fill = data
    }
    //设置边框
    setBorder(data){
        if(data == 'true'){
            this.cell.attr({style:{stroke: '#000',lineWidth:2}})
            this.cell.attr({z:2})
        }else{
            this.cell.attr({style:{stroke: '#aaa',lineWidth:1}})
            this.cell.attr({z:1})
        }
        this.data.border = data
    }
    //设置对齐方式
    setTextAlign(data){
        if(data == 'left'){
            this.cell.attr({style:{
                textAlign:'left',
                textPosition:'left',
                textOffset:[10,0]
            }})
        }else if(data == 'right'){
            this.cell.attr({style:{
                textAlign:'right',
                textPosition:'right',
                textOffset:[-10,0]
            }})
        }else if(data == 'center'){
            this.cell.attr({style:{
                textAlign:'center',
                textPosition:'inside',
                textOffset:[0,0]
            }})
        }
        this.data.textAlign = data
    }
    //设置单元格data
    setData(data){
        this.data = Object.assign({},this.data,data)
        //更改cell的大小
        this.cell.attr({shape:{
            width:this.data.cellWidth * 2,
            height:this.data.cellHeight * 2
        }})
        //更改图片
        if(this.data.imgUrl){
            this.addImage(this.data.imgUrl)
        }else{
            if(this.img){
                this.removeImage()
            }else{
                
            }
        }
        //更改cell的显示隐藏
        if(this.data.merge == true && (this.data.row == 0 || this.data.span == 0)){
            this.hide()
        }else{
            this.show()
        }
        this.attr('position',[this.data.xPlace,this.data.yPlace])
        //更改文字
        this.setText(this.data.text)
        //更改字体
        this.setFontFamily(this.data.fontFamily)
        //更改字体大小
        this.setFontSize(this.data.fontSize)
        //更改文字粗细
        this.setFontWeight(this.data.fontWeight)
        //更改文字倾斜
        this.setFontItalic(this.data.fontStyle)
        //更改字体颜色
        this.setTextFill(this.data.textFill)
        //更改背景颜色
        this.setFill(this.data.fill)
        //设置边框
        this.setBorder(this.data.border)
        //设置对齐方式
        this.setTextAlign(this.data.textAlign)
        //设置左上角标
        this.setLTIcon(this.data.ltIcon)
        //设置右上角标
        this.setRTIcon(this.data.rtIcon)
        //设置左下角标
        this.setLBIcon(this.data.lbIcon)
        //设置右下角标
        this.setRBIcon(this.data.rbIcon)
    }
    //设置左上角标
    setLTIcon(data){
        if(data){
            if(data == "none"){
                if(this.ltIcon){
                    this.remove(this.ltIcon)
                    this.ltIcon = null
                }
            }else{
                if(this.ltIcon){
                    this.remove(this.ltIcon)
                }
                this.ltIcon = new zrender.Image({
                    style:{
                        image:icons[data],
                        x:0,
                        y:0,
                        width:15,
                        height:15
                    },
                    z:3
                })
                this.add(this.ltIcon)
            }
        }else{
            if(this.ltIcon){
                this.remove(this.ltIcon)
                this.ltIcon = null
            }
        }
        this.data.ltIcon = data
    }
    //设置左下角标
    setLBIcon(data){
        if(data){
            if(data == "none"){
                if(this.lbIcon){
                    this.remove(this.lbIcon)
                    this.lbIcon = null
                }
            }else{
                if(this.lbIcon){
                    this.remove(this.lbIcon)
                }
                this.lbIcon = new zrender.Image({
                    style:{
                        image:icons[data],
                        x:0,
                        y:this.data.cellHeight - 15,
                        width:15,
                        height:15
                    },
                    z:3
                })
                this.add(this.lbIcon)
            }
        }else{
            if(this.lbIcon){
                this.remove(this.lbIcon)
                this.lbIcon = null
            }
        }
        this.data.lbIcon = data
    }
    //设置右上角标
    setRTIcon(data){
        if(data){
            if(data == "none"){
                if(this.rtIcon){
                    this.remove(this.rtIcon)
                    this.rtIcon = null
                }
            }else{
                if(this.rtIcon){
                    this.remove(this.rtIcon)
                }
                this.rtIcon = new zrender.Image({
                    style:{
                        image:icons[data],
                        x:this.data.cellWidth - 15,
                        y:0,
                        width:15,
                        height:15
                    },
                    z:3
                })
                this.add(this.rtIcon)
            }
        }else{
            if(this.rtIcon){
                this.remove(this.rtIcon)
                this.rtIcon = null
            }
        }
        this.data.rtIcon = data
    }
    //设置右下角标
    setRBIcon(data){
        if(data){
            if(data == "none"){
                if(this.rbIcon){
                    this.remove(this.rbIcon)
                    this.rbIcon = null
                }
            }else{
                if(this.rbIcon){
                    this.remove(this.rbIcon)
                }
                this.rbIcon = new zrender.Image({
                    style:{
                        image:icons[data],
                        x:this.data.cellWidth - 15,
                        y:this.data.cellHeight - 15,
                        width:15,
                        height:15
                    },
                    z:3
                })
                this.add(this.rbIcon)
            }
        }else{
            if(this.rbIcon){
                this.remove(this.rbIcon)
                this.rbIcon = null
            }
        }
        this.data.rbIcon = data
    }
    //添加图片
    addImage(url){
        this.data.imgUrl = url
        if(this.img){
            this.remove(this.img)
            this.img = null
        }
        this.setText("")
        this.img = new zrender.Image({
            style:{
                image:url,
                x:0,
                y:0,
                width:this.data.cellWidth,
                height:this.data.cellHeight
            },
            z:2
        })
        this.add(this.img)
    }
    removeImage(){
        if(this.img){
            this.remove(this.img)
            this.img = null
            this.data.imgUrl = ""
        }
    }
    clear(){
        let data = {
            fontFamily:'微软雅黑',
            fontSize:14,
            fontStyle:'normal',
            fontWeight:'normal',
            textFill:'#000000',
            fill:'#ffffff',
            border:false,
            textAlign:'center',
            cellWidth:this.data.cellWidth,
            cellHeight:this.data.cellHeight,
            merge:this.data.merge,
            row:this.data.row,
            span:this.data.span,
            mergeConfig:this.data.mergeConfig,
            text:"",
            xPlace:this.data.xPlace,
            yPlace:this.data.yPlace,
            imgUrl:'',
            x:this.data.x,
            y:this.data.y
        }
        this.data = data
        this.setData(data)
    }
    clearFormat(){
        let data = {
            fontFamily:'微软雅黑',
            fontSize:14,
            fontStyle:'normal',
            fontWeight:'normal',
            textFill:'#000000',
            fill:'#ffffff',
            border:false,
            textAlign:'center',
        }
        this.setData(data)
    }
}

export default Cell