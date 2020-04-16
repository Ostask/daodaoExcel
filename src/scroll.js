import Event from "./event.js"
import {scrollWidth} from './config.js'

class Scroll extends Event{
    constructor(config){
        const defaultConfig= {
            bgColor:'rgba(199,199,199,0.3)',
            hoverBgColor:'rgba(199,199,199,0.5)',
            scrollColor:'rgba(167,167,167,0.3)',
            scrollWidth:scrollWidth,
            hoverColor:'rgba(167,167,167,0.6)'
        }
        super()
        this.config = Object.assign({},defaultConfig,config)
        //纵向滚动条的包围盒
        this.scrollHeight = null
        //纵向滚动条的操纵条
        this.scrollHeightBtn = null
        //横向滚动条的包围盒
        this.scrollWidth = null
        //横向滚动条的操纵条
        this.scrollWidthBtn = null
        //鼠标点下去的时候的x,y坐标
        this.originMouseXY = [0,0]
        this.originScrollXY = [0,0]
        this.init(config.parent)
    }
    init(parent){
        document.addEventListener('mouseup',()=>{
            if(this.mouseMoveY){
                document.removeEventListener('mousemove',this.mouseMoveY)
            }
            if(this.mouseMoveX){
                document.removeEventListener('mousemove',this.mouseMoveX)
            }
        })
       this.addScrollY(parent)
       this.addScrollX(parent)
    }
    scrollY(moveY){
        //将进度换算成进度条的移动
        let moveScroll =  - moveY / this.config.fullHeight * this.config.wrapHeight
        if(moveScroll < 0){
            moveScroll = 0
        }
        if(moveScroll > this.config.wrapHeight - (this.config.wrapHeight / this.config.fullHeight * this.config.wrapHeight)){
            moveScroll = this.config.wrapHeight - (this.config.wrapHeight / this.config.fullHeight * this.config.wrapHeight)
        }
        if(this.scrollHeight){
            this.scrollHeightBtn.style.top = moveScroll + 'px'
        }
    }
    mouseMoveY(event){
        //鼠标拖动的距离为
        let distance = event.pageY - this.originMouseXY[1]
        let positionY = this.originScrollXY[1] + distance
        if(positionY < 0){
            positionY = 0
        }
        if(positionY > this.config.wrapHeight - (this.config.wrapHeight / this.config.fullHeight * this.config.wrapHeight)){
            positionY = this.config.wrapHeight - (this.config.wrapHeight / this.config.fullHeight * this.config.wrapHeight)
        }
        this.scrollHeightBtn.style.top = positionY + 'px'
        //换算成页面需要挪动多少
        let pageMoveY = -positionY / this.config.wrapHeight * (this.config.fullHeight + this.config.scrollWidth)
        this.emit('scrollY',{
            pageMove:pageMoveY
        })
    }
    mouseMoveX(event){
        //鼠标拖动的距离为
        let distance = event.pageX - this.originMouseXY[0]
        let positionX = this.originScrollXY[0] + distance
        if(positionX < 0){
            positionX = 0
        }
        if(positionX > this.config.wrapWidth - (this.config.wrapWidth / this.config.fullWidth * this.config.wrapWidth)){
            positionX = this.config.wrapWidth - (this.config.wrapWidth / this.config.fullWidth * this.config.wrapWidth)
        }
        this.scrollWidthBtn.style.left = positionX + 'px'
        //换算成页面需要挪动多少
        let pageMoveX = -positionX / this.config.wrapWidth * (this.config.fullWidth + this.config.scrollWidth)
        this.emit('scrollX',{
            pageMove:pageMoveX
        })
    }
    addScrollY(){
        //判断是否需要加纵向滚动条
        if(this.config.wrapHeight < this.config.fullHeight){
            this.scrollHeight = document.createElement('div')
            this.scrollHeight.id = "daodao_excel_scroll_height_wrapper"
            this.scrollHeightBtn = document.createElement('div')
            this.scrollHeightBtn.id = "daodao_excel_scroll_height_btn"
            this.scrollHeight.appendChild(this.scrollHeightBtn)
            const parent = this.config.parent
            parent.appendChild(this.scrollHeight)
            parent.style.position = "relative"

            //设置纵向滚动条的style
            this.scrollHeight.style.cssText = `
                position:absolute;
                bottom:0;
                right:0;
                height:${this.config.wrapHeight}px;
                width:${this.config.scrollWidth}px;
                background:${this.config.bgColor};
            `
            this.scrollHeightBtn.style.cssText = `
                position:absolute;
                cursor:pointer;
                border-radius:${this.config.scrollWidth / 2}px;
                top:0;
                left:1px;
                height:${this.config.wrapHeight / this.config.fullHeight * this.config.wrapHeight}px;
                width:${this.config.scrollWidth - 2}px;
                background:${this.config.scrollColor};
            `
            const style = document.createElement('style')
            style.innerHTML = `#daodao_excel_scroll_height_wrapper:hover{
                background:${this.config.hoverBgColor}!important;
            }
            #daodao_excel_scroll_height_btn:hover{
                background:${this.config.hoverColor}!important;
            }`
            this.scrollHeight.appendChild(style)

            //给纵向滚动条加事件
            this.scrollHeightBtn.addEventListener('mousedown',(event) => {
                this.originMouseXY = [event.pageX,event.pageY]
                this.originScrollXY = [parseInt(this.scrollWidthBtn.style.left),parseInt(this.scrollHeightBtn.style.top)]
                this.mouseMoveY = this.mouseMoveY.bind(this)
                document.addEventListener('mousemove',this.mouseMoveY)
            })
        }
    }
    addScrollX(){
        //判断是否需要加横向滚动条
        if(this.config.wrapWidth < this.config.fullWidth){
            this.scrollWidth = document.createElement('div')
            this.scrollWidth.id = "daodao_excel_scroll_width_wrapper"
            this.scrollWidthBtn = document.createElement('div')
            this.scrollWidthBtn.id = "daodao_excel_scroll_width_btn"
            this.scrollWidth.appendChild(this.scrollWidthBtn)
            const parent = this.config.parent
            parent.appendChild(this.scrollWidth)
            parent.style.position = "relative"

            //设置纵向滚动条的style
            this.scrollWidth.style.cssText = `
                position:absolute;
                bottom:0;
                right:${this.config.scrollWidth}px;
                height:${this.config.scrollWidth}px;
                width:${this.config.wrapWidth - this.config.scrollWidth}px;
                background:${this.config.bgColor};
            `
            this.scrollWidthBtn.style.cssText = `
                position:absolute;
                cursor:pointer;
                border-radius:${this.config.scrollWidth / 2}px;
                top:1px;
                left:0;
                width:${this.config.wrapWidth / this.config.fullWidth * (this.config.wrapWidth - this.config.scrollWidth)}px;
                height:${this.config.scrollWidth - 2}px;
                background:${this.config.scrollColor};
            `
            const style = document.createElement('style')
            style.innerHTML = `#daodao_excel_scroll_width_wrapper:hover{
                background:${this.config.hoverBgColor}!important;
            }
            #daodao_excel_scroll_width_btn:hover{
                background:${this.config.hoverColor}!important;
            }`
            this.scrollWidth.appendChild(style)

            //给横向滚动条加事件
            this.scrollWidthBtn.addEventListener('mousedown',(event) => {
                this.originMouseXY = [event.pageX,event.pageY]
                this.originScrollXY = [parseInt(this.scrollWidthBtn.style.left),parseInt(this.scrollHeightBtn.style.top)]
                this.mouseMoveX = this.mouseMoveX.bind(this)
                document.addEventListener('mousemove',this.mouseMoveX)
            })
        }
    }
    refresh(data){
        this.config = Object.assign({},this.config,data)
        //判断是否要纵向滚动条
        if(this.config.wrapWidth < this.config.fullWidth){
            if(this.scrollHeight){
                //改一下纵向滚动条
                //设置纵向滚动条的style
                this.scrollHeight.style.height = `${this.config.wrapHeight}px`
                this.scrollHeightBtn.style.height = `${this.config.wrapHeight / this.config.fullHeight * this.config.wrapHeight}px`
            }else{
                this.addScrollY()
            }
        }else{
            //移除纵向滚动条
            if(this.scrollHeight){
                parent.removeChild("daodao_excel_scroll_height_wrapper")
                this.scrollHeight = null
            }
        }
        //判断是否要横向滚动条
        if(this.config.wrapWidth < this.config.fullWidth){
            if(this.scrollWidth){
                //改一下横向滚动条
                //设置纵向滚动条的style
                this.scrollWidth.style.width = `${this.config.wrapWidth - this.config.scrollWidth}px`
                this.scrollWidthBtn.style.width = `${this.config.wrapWidth / this.config.fullWidth * (this.config.wrapWidth - this.config.scrollWidth)}px`
            }else{
                this.addScrollX()
            }
        }else{
            //移除纵向滚动条
            if(this.scrollWidth){
                parent.removeChild("daodao_excel_scroll_width_wrapper")
                this.scrollWidth = null
            }
        }
    }
}

export default Scroll