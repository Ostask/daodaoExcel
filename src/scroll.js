import Event from "./event.js"

class Scroll extends Event{
    constructor(config){
        const defaultConfig= {
            bgColor:'rgba(199,199,199,0.3)',
            hoverBgColor:'rgba(199,199,199,0.5)',
            scrollColor:'rgba(167,167,167,0.3)',
            scrollWidth:10,
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
        this.init()
    }
    init(){
        //判断是否需要加纵向滚动条
        if(this.config.wrapHeight < this.config.fullHeight){
            this.scrollHeight = document.createElement('div')
            this.scrollHeight.id = "daodao_excel_scroll_height_wrapper"
            this.scrollHeightBtn = document.createElement('div')
            this.scrollHeightBtn.id = "daodao_excel_scroll_height_btn"
            this.scrollHeight.appendChild(this.scrollHeightBtn)
            const parent = document.getElementById(this.config.wrapperId) 
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
        }
        //判断是否需要加横向滚动条
        if(this.config.wrapWidth < this.config.fullWidth){
            this.scrollWidth = document.createElement('div')
            this.scrollWidth.id = "daodao_excel_scroll_width_wrapper"
            this.scrollWidthBtn = document.createElement('div')
            this.scrollWidthBtn.id = "daodao_excel_scroll_width_btn"
            this.scrollWidth.appendChild(this.scrollWidthBtn)
            const parent = document.getElementById(this.config.wrapperId) 
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
            this.scrollHeight.appendChild(style)
        }
    }
}

export default Scroll