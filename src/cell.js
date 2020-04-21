import zrender from 'zrender'
import {headerHeight,indexWidth} from './config'

class Cell extends zrender.Group{
    constructor(data,config){
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
                fill:data.fill
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
        this.img = null
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
    //设置单元格data
    setData(data){
        this.data = Object.assign({},this.data,data)
        //更改cell的大小
        this.cell.attr({shape:{
            width:this.data.cellWidth * 2,
            height:this.data.cellHeight * 2
        }})
        if(this.img){
            this.img.attr({
                style:{
                    width:this.data.cellWidth,
                    height:this.data.cellHeight
                }
            })
        }
        //更改cell的显示隐藏
        if(this.data.merge == true && (this.data.row == 0 || this.data.span == 0)){
            this.hide()
        }else{
            this.show()
        }
        this.attr('position',[this.data.xPlace,this.data.yPlace])
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
}

export default Cell