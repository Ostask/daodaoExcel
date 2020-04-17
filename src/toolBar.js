import Event from "./event.js"
import {preventDefault,stopPropagation ,generateUUID} from "./utils.js"

class ToolBar extends Event{
    constructor(parent){
        super()
        this.el = null
        this.typeFaceButton = null
        this.fontSizeButton = null
        this.fontWeightButton = null
        this.fontItalicButton = null
        this.underLineButton = null
        this.init(parent)
    }
    init(parent){
        this.el = document.createElement('div')
        this.el.id = 'daodao_excel_scroll_toolbar-wrapper'
        this.el.style.cssText = `
            height:30px;
        `
        const first = parent.firstChild
        parent.insertBefore(this.el,first)
        this.initStyle()
        this.initTypeFace()
        this.initFontSize()
        this.initFontWeight()
        this.initFontItalic()
        this.initUnderLine()
    }
    initStyle(){
        const style = document.createElement('style')
        style.innerHTML = `
            #daodao_excel_scroll_toolbar-wrapper .toolbar-item{
                display: inline-block;
                position:relative;
                border:1px solid transparent;
                vertical-align: middle;
                cursor: pointer;
            }
            #daodao_excel_scroll_toolbar-wrapper .toolbar-item .tooltip__down{
                display:none;
                position:absolute;
                margin-top:10px;
                left:50%;
                margin-left:-35px;
                width:70px;
                height:22px;
                line-height: 22px;
                font-size:12px;
                border:1px solid #d0d0d0;
                background: #fff;
                text-align: center;
                z-index:10;
            }
            #daodao_excel_scroll_toolbar-wrapper .toolbar-item .tooltip__down:before{
                content:'';
                width:0;
                height:0;
                border-bottom:8px solid #d0d0d0;
                border-right:5px solid transparent;
                border-left:5px solid transparent;
                position:absolute;
                top:-8px;
                left:50%;
                margin-left:-5px;
            }
            #daodao_excel_scroll_toolbar-wrapper .toolbar-item .tooltip__down:after{
                content:'';
                width:0;
                height:0;
                border-bottom:8px solid #ffffff;
                border-right:5px solid transparent;
                border-left:5px solid transparent;
                position:absolute;
                top:-6px;
                left:50%;
                margin-left:-5px;
            }
            #daodao_excel_scroll_toolbar-wrapper .toolbar-item:hover{
                border:1px solid #d0d0d0;
            }
            #daodao_excel_scroll_toolbar-wrapper .toolbar-item:hover .tooltip__down{
                display: block;
            }
            #daodao_excel_scroll_toolbar-wrapper .toolbar-button{
                width:20px;
                height:20px;
                text-align: center;
                background:#fff;
            }
            #daodao_excel_scroll_toolbar-wrapper .toolbar-button.active{
                background:#e0e0e0
            }
        `
        this.el.appendChild(style)
    }
    initTypeFace(){
        const id = generateUUID()
        const html = `
            <select id="${id}">
                <option value="微软雅黑">微软雅黑</option>
                <option value="宋体">宋体</option>
                <option value="Arial">Arial</option>
                <option value="Tahoma">Tahoma</option>
                <option value="Verdana">Verdana</option>
            </select>
            <div class="tooltip__down">
                选择字体
            </div>
        `
        let div = document.createElement('div')
        div.classList = ["toolbar-item"]
        div.innerHTML = html

        const style = document.createElement('style')
        style.innerHTML = `
            #daodao_excel_scroll_toolbar-wrapper select{
                border:none!important;
                outline: none!important;
            }
        `
        this.el.appendChild(style)

        this.el.appendChild(div)

        this.typeFaceButton = document.getElementById(id)
        
        this.typeFaceButton.addEventListener('change',(e) => {
            this.emit('changeTypeFace',{
                data:e.target.value
            })
        })
    }
    initFontSize(){
        const id = generateUUID()
        const html = `
            <select id="${id}">
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
                <option value="12">12</option>
                <option value="14">14</option>
                <option value="16">16</option>
                <option value="18">18</option>
                <option value="20">20</option>
                <option value="24">24</option>
                <option value="30">20</option>
                <option value="36">36</option>
            </select>
            <div class="tooltip__down">
                字体大小
            </div>
        `
        let div = document.createElement('div')
        div.classList = ["toolbar-item"]
        div.innerHTML = html

        this.el.appendChild(div)

        this.fontSizeButton = document.getElementById(id)
        
        this.fontSizeButton.addEventListener('change',(e) => {
            this.emit('changeFontSize',{
                data:e.target.value
            })
        })
    }
    initFontWeight(){
        this.fontWeightButton = this.addButton(
            '<svg t="1586917665010" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2949" width="16" height="16"><path d="M311.296 460.8h266.24c59.392 0 108.544-49.152 108.544-108.544s-49.152-108.544-108.544-108.544h-266.24V460.8z m-30.72-296.96h296.96c104.448 0 190.464 83.968 190.464 190.464 0 55.296-22.528 104.448-61.44 139.264 55.296 34.816 92.16 98.304 92.16 167.936 0 110.592-90.112 198.656-198.656 198.656h-368.64v-696.32h49.152z m30.72 614.4h286.72c65.536 0 116.736-53.248 116.736-116.736s-53.248-116.736-116.736-116.736h-286.72v233.472z" p-id="2950"></path></svg>',
            '加粗',
             (e)=>{
                 if(e){
                    this.emit('changeFontWeight',{
                        data:'bold'
                    })
                 }else{
                    this.emit('changeFontWeight',{
                        data:'normal'
                    })
                 }
             },
             true   
        )
    }
    initFontItalic(){
        this.fontItalicButton = this.addButton(
            '<svg t="1586917855578" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3832" width="16" height="16"><path d="M517.888 693.376c-3.456 18.688-5.376 32.448-5.76 41.088-0.32 8.64 0.512 15.488 2.496 20.48s5.568 9.216 10.688 12.544 13.824 6.72 26.112 10.048l-3.776 20.48H369.984l3.776-20.48c18.24-4.48 30.848-9.408 37.696-14.912 6.912-5.44 12.16-13.184 15.872-23.296 3.712-10.048 7.424-25.408 11.328-46.08l67.392-362.56c3.584-19.328 5.504-33.28 5.76-42.112 0.192-8.768-0.832-15.616-3.136-20.544-2.304-4.864-5.888-8.768-10.624-11.712-4.8-2.944-13.376-6.208-25.536-9.856l3.776-20.48h177.728l-3.776 20.48c-12.928 3.072-22.464 6.144-28.48 9.216-6.08 3.072-11.136 6.912-15.232 11.52s-7.744 11.52-11.008 20.736c-3.264 9.152-6.72 23.424-10.304 42.688l-67.328 362.752z" fill="" p-id="3833"></path></svg>',
            '倾斜',
             (e)=>{
                 if(e){
                    this.emit('changeFontItalic',{
                        data:'italic'
                    })
                 }else{
                    this.emit('changeFontItalic',{
                        data:'normal'
                    })
                 }
             },
             true   
        )
    }
    initUnderLine(){
        this.underLineButton = this.addButton(
            '<svg t="1586917547845" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2330" width="16" height="16"><path d="M244.80391196 930.26336805v-53.30830343l534.39217608-4.84906561v53.29783023L244.80391196 930.26336805zM753.79871378 521.41276965q0 273.50615719-248.10878291 273.50615797-237.74037025 0-237.74037027-263.92323078V139.30010844h83.26149514v387.93572969q0 193.57512211 162.33373288 193.5751221 156.94006385 0 156.94006386-187.3331282V139.24774305H753.79871378z" fill="" p-id="2331"></path></svg>',
            '下划线',
             (e)=>{
                 if(e){
                    this.emit('changeUnderLine',{
                        data:true
                    })
                 }else{
                    this.emit('changeUnderLine',{
                        data:false
                    })
                 }
             },
             true   
        )
    }
    addButton(innerHTML,tip,func,hasStatus){
        let dom = document.createElement('div')
        dom.classList.add("toolbar-item","toolbar-button")
        let html = `
            ${innerHTML}
            <div class="tooltip__down">
                ${tip}
            </div>
        `
        dom.innerHTML = html
        this.el.appendChild(dom)
        dom.addEventListener("click",()=>{
            if(hasStatus){
                if(dom.classList.contains('active')){
                    dom.classList.remove("active")
                    func(false)
                }else{
                    dom.classList.add("active")
                    func(true)
                }
            }else{
                func()
            }
        })
        return dom
    }
    setConfig(config){
        this.typeFaceButton.value = config.fontFamily
        this.fontSizeButton.value = config.fontSize
        if(config.fontWeight == 'bold'){
            this.fontWeightButton.classList.add('active')
        }else{
            this.fontWeightButton.classList.remove('active')
        }
        if(config.fontStyle == 'italic'){
            this.fontItalicButton.classList.add('active')
        }else{
            this.fontItalicButton.classList.remove('active')
        }
    }
}

export default ToolBar