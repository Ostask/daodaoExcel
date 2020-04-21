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
        this.textFillButton = null
        this.fillButton = null
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
        this.initTextFill()
        this.initFill()
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
                <option value="30">30</option>
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
    initTextFill(){
        const id = generateUUID()
        const id1 = generateUUID()
        const id2 = generateUUID()
        const html = `
            <div class="toolbar-icon" id="${id1}">
                <svg style="margin-top: 2px;vertical-align: top" t="1586918593118" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4607" width="12" height="12"><path d="M792.864 922.112l103.584-2.176L572.576 110.24h-89.184L161.696 919.936H264l66.944-167.936h394.112l67.808 170.112zM369.216 656L528 257.632 686.784 656h-317.568z" p-id="4608"></path></svg>
                <div class="color-line" style="width:12px;height:2px;background-color:#000;line-height:0px;margin-top:-6px;border:1px solid #aaa"></div>
            </div>
            <div class="tooltip__down">
                文字颜色
            </div>
            <div class="dropdown-icon">
                <svg id="${id2}" style="height:16px;" t="1586922548084" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5368" width="8" height="8"><path d="M958.009 307.2c0-9.317-3.554-18.636-10.663-25.746-14.219-14.218-37.273-14.218-51.491 0l-383.854 383.856-383.854-383.856c-14.219-14.218-37.271-14.218-51.49 0-14.219 14.22-14.219 37.271 0 51.491l409.6 409.6c14.219 14.218 37.271 14.218 51.49 0l409.6-409.6c7.109-7.11 10.663-16.429 10.663-25.746z" p-id="5369"></path></svg>
                <div class="dropdown-card" id="${id}">
                    <div class="color-button" data-color="#ffffff" style="background-color:#ffffff"></div>
                    <div class="color-button" data-color="#0d0015" style="background-color:#0d0015"></div>
                    <div class="color-button" data-color="#fe2c23" style="background-color:#fe2c23"></div>
                    <div class="color-button" data-color="#ff9900" style="background-color:#ff9900"></div>
                    <div class="color-button" data-color="#ffd900" style="background-color:#ffd900"></div>
                    <div class="color-button" data-color="#a3e043" style="background-color:#a3e043"></div>
                    <div class="color-button" data-color="#37d9f0" style="background-color:#37d9f0"></div>
                    <div class="color-button" data-color="#4da8ee" style="background-color:#4da8ee"></div>
                    <div class="color-button" data-color="#956FE7" style="background-color:#956FE7"></div>

                    <div class="color-button" data-color="#F3F3F4" style="background-color:#F3F3F4"></div>
                    <div class="color-button" data-color="#CCCCCC" style="background-color:#CCCCCC"></div>
                    <div class="color-button" data-color="#FEF2F0" style="background-color:#FEF2F0"></div>
                    <div class="color-button" data-color="#FEF5E7" style="background-color:#FEF5E7"></div>
                    <div class="color-button" data-color="#FEFCD9" style="background-color:#FEFCD9"></div>
                    <div class="color-button" data-color="#EDF6E8" style="background-color:#EDF6E8"></div>
                    <div class="color-button" data-color="#E6FAFA" style="background-color:#E6FAFA"></div>
                    <div class="color-button" data-color="#EBF4FC" style="background-color:#EBF4FC"></div>
                    <div class="color-button" data-color="#F0EDF6" style="background-color:#F0EDF6"></div>

                    <div class="color-button" data-color="#D7D8D9" style="background-color:#D7D8D9"></div>
                    <div class="color-button" data-color="#A5A5A5" style="background-color:#A5A5A5"></div>
                    <div class="color-button" data-color="#FBD4D0" style="background-color:#FBD4D0"></div>
                    <div class="color-button" data-color="#FFD7B9" style="background-color:#FFD7B9"></div>
                    <div class="color-button" data-color="#F9EDA6" style="background-color:#F9EDA6"></div>
                    <div class="color-button" data-color="#d4e9d6" style="background-color:#d4e9d6"></div>
                    <div class="color-button" data-color="#C7E6EA" style="background-color:#C7E6EA"></div>
                    <div class="color-button" data-color="#CCE0F1" style="background-color:#CCE0F1"></div>
                    <div class="color-button" data-color="#DAD5E9" style="background-color:#DAD5E9"></div>

                    <div class="color-button" data-color="#7B7F83" style="background-color:#7B7F83"></div>
                    <div class="color-button" data-color="#494949" style="background-color:#494949"></div>
                    <div class="color-button" data-color="#EE7976" style="background-color:#EE7976"></div>
                    <div class="color-button" data-color="#FAA573" style="background-color:#FAA573"></div>
                    <div class="color-button" data-color="#e6b322" style="background-color:#e6b322"></div>
                    <div class="color-button" data-color="#98C091" style="background-color:#98C091"></div>
                    <div class="color-button" data-color="#79C6CD" style="background-color:#79C6CD"></div>
                    <div class="color-button" data-color="#6EAAD7" style="background-color:#6EAAD7"></div>
                    <div class="color-button" data-color="#9C8EC1" style="background-color:#9C8EC1"></div>

                    <div class="color-button" data-color="#41464B" style="background-color:#41464B"></div>
                    <div class="color-button" data-color="#333333" style="background-color:#333333"></div>
                    <div class="color-button" data-color="#BE1A1D" style="background-color:#BE1A1D"></div>
                    <div class="color-button" data-color="#B95514" style="background-color:#B95514"></div>
                    <div class="color-button" data-color="#AD720E" style="background-color:#AD720E"></div>
                    <div class="color-button" data-color="#1C7231" style="background-color:#1C7231"></div>
                    <div class="color-button" data-color="#1C7892" style="background-color:#1C7892"></div>
                    <div class="color-button" data-color="#19439C" style="background-color:#19439C"></div>
                    <div class="color-button" data-color="#511B78" style="background-color:#511B78"></div>
                </div>
            </div>
        `
        let div = document.createElement('div')
        div.classList.add("toolbar-item","toolbar-drop-down","toolbar-color")
        div.innerHTML = html

        const style = document.createElement('style')
        style.innerHTML = `
            #daodao_excel_scroll_toolbar-wrapper .dropdown-icon{
                height:20px;
                display: inline-block;
            }
            #daodao_excel_scroll_toolbar-wrapper .toolbar-icon{
                height:20px;
                display: inline-block;
            }
            #daodao_excel_scroll_toolbar-wrapper .toolbar-color .dropdown-icon .dropdown-card{
                display: none;
                position:absolute;
                left:50%;
                margin-left:-110px;
                width:220px;
                line-height: 22px;
                font-size:12px;
                border:1px solid #d0d0d0;
                background: #fff;
                text-align: center;
                z-index:10;
            }
            #daodao_excel_scroll_toolbar-wrapper .toolbar-color .dropdown-icon .dropdown-card:before{
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
            #daodao_excel_scroll_toolbar-wrapper .toolbar-color .dropdown-icon .dropdown-card:after{
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
            #daodao_excel_scroll_toolbar-wrapper .toolbar-color .dropdown-card .color-button{
                width:20px;
                height:20px;
                float:left;
                margin:4px 2px;
            }
            #daodao_excel_scroll_toolbar-wrapper .toolbar-color .dropdown-card .color-button:hover{
                box-shadow:0 0 7px 2px #d0d0d0;
            }
    
        `
        this.el.appendChild(style)

        this.el.appendChild(div)

        this.textFillButton = document.getElementById(id1)

        document.getElementById(id2).addEventListener('click',(event) => {
            stopPropagation(event)
            document.getElementById(id).style.display = 'block'
        })

        document.addEventListener('click',() => {
            document.getElementById(id).style.display = 'none'
        })
        
        document.getElementById(id).addEventListener('click',(e) => {
            let color = e.target.dataset.color
            document.getElementById(id).style.display = 'none'
            this.emit('changeTextFill',{
                data:color
            })
            this.textFillButton.querySelector(".color-line").style.backgroundColor = color
        })
    }
    initFill(){
        const id = generateUUID()
        const id1 = generateUUID()
        const id2 = generateUUID()
        const html = `
            <div class="toolbar-icon" id="${id1}">
                <svg t="1586930965024" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5660" width="16" height="16"><path d="M896 384c-46.72-46.72-160.64-25.6-219.52-10.24L448.64 152.96l-21.76 21.76L313.6 65.28 223.36 152.96 336.64 262.4 66.56 524.16v2.56L448.64 896l359.68-349.44L960 693.12S960 448 896 384zM194.56 524.16l255.36-247.68 254.72 247.68H194.56z" p-id="5661"></path></svg>
                <div class="color-line" style="width:12px;height:2px;background-color:#000;line-height:0px;margin-top:-6px;border:1px solid #aaa;"></div>
            </div>
            <div class="tooltip__down">
                背景颜色
            </div>
            <div class="dropdown-icon">
                <svg id="${id2}" style="height:16px;" t="1586922548084" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5368" width="8" height="8"><path d="M958.009 307.2c0-9.317-3.554-18.636-10.663-25.746-14.219-14.218-37.273-14.218-51.491 0l-383.854 383.856-383.854-383.856c-14.219-14.218-37.271-14.218-51.49 0-14.219 14.22-14.219 37.271 0 51.491l409.6 409.6c14.219 14.218 37.271 14.218 51.49 0l409.6-409.6c7.109-7.11 10.663-16.429 10.663-25.746z" p-id="5369"></path></svg>
                <div class="dropdown-card" id="${id}">
                    <div class="color-button" data-color="#ffffff" style="background-color:#ffffff"></div>
                    <div class="color-button" data-color="#0d0015" style="background-color:#0d0015"></div>
                    <div class="color-button" data-color="#fe2c23" style="background-color:#fe2c23"></div>
                    <div class="color-button" data-color="#ff9900" style="background-color:#ff9900"></div>
                    <div class="color-button" data-color="#ffd900" style="background-color:#ffd900"></div>
                    <div class="color-button" data-color="#a3e043" style="background-color:#a3e043"></div>
                    <div class="color-button" data-color="#37d9f0" style="background-color:#37d9f0"></div>
                    <div class="color-button" data-color="#4da8ee" style="background-color:#4da8ee"></div>
                    <div class="color-button" data-color="#956FE7" style="background-color:#956FE7"></div>

                    <div class="color-button" data-color="#F3F3F4" style="background-color:#F3F3F4"></div>
                    <div class="color-button" data-color="#CCCCCC" style="background-color:#CCCCCC"></div>
                    <div class="color-button" data-color="#FEF2F0" style="background-color:#FEF2F0"></div>
                    <div class="color-button" data-color="#FEF5E7" style="background-color:#FEF5E7"></div>
                    <div class="color-button" data-color="#FEFCD9" style="background-color:#FEFCD9"></div>
                    <div class="color-button" data-color="#EDF6E8" style="background-color:#EDF6E8"></div>
                    <div class="color-button" data-color="#E6FAFA" style="background-color:#E6FAFA"></div>
                    <div class="color-button" data-color="#EBF4FC" style="background-color:#EBF4FC"></div>
                    <div class="color-button" data-color="#F0EDF6" style="background-color:#F0EDF6"></div>

                    <div class="color-button" data-color="#D7D8D9" style="background-color:#D7D8D9"></div>
                    <div class="color-button" data-color="#A5A5A5" style="background-color:#A5A5A5"></div>
                    <div class="color-button" data-color="#FBD4D0" style="background-color:#FBD4D0"></div>
                    <div class="color-button" data-color="#FFD7B9" style="background-color:#FFD7B9"></div>
                    <div class="color-button" data-color="#F9EDA6" style="background-color:#F9EDA6"></div>
                    <div class="color-button" data-color="#d4e9d6" style="background-color:#d4e9d6"></div>
                    <div class="color-button" data-color="#C7E6EA" style="background-color:#C7E6EA"></div>
                    <div class="color-button" data-color="#CCE0F1" style="background-color:#CCE0F1"></div>
                    <div class="color-button" data-color="#DAD5E9" style="background-color:#DAD5E9"></div>

                    <div class="color-button" data-color="#7B7F83" style="background-color:#7B7F83"></div>
                    <div class="color-button" data-color="#494949" style="background-color:#494949"></div>
                    <div class="color-button" data-color="#EE7976" style="background-color:#EE7976"></div>
                    <div class="color-button" data-color="#FAA573" style="background-color:#FAA573"></div>
                    <div class="color-button" data-color="#e6b322" style="background-color:#e6b322"></div>
                    <div class="color-button" data-color="#98C091" style="background-color:#98C091"></div>
                    <div class="color-button" data-color="#79C6CD" style="background-color:#79C6CD"></div>
                    <div class="color-button" data-color="#6EAAD7" style="background-color:#6EAAD7"></div>
                    <div class="color-button" data-color="#9C8EC1" style="background-color:#9C8EC1"></div>

                    <div class="color-button" data-color="#41464B" style="background-color:#41464B"></div>
                    <div class="color-button" data-color="#333333" style="background-color:#333333"></div>
                    <div class="color-button" data-color="#BE1A1D" style="background-color:#BE1A1D"></div>
                    <div class="color-button" data-color="#B95514" style="background-color:#B95514"></div>
                    <div class="color-button" data-color="#AD720E" style="background-color:#AD720E"></div>
                    <div class="color-button" data-color="#1C7231" style="background-color:#1C7231"></div>
                    <div class="color-button" data-color="#1C7892" style="background-color:#1C7892"></div>
                    <div class="color-button" data-color="#19439C" style="background-color:#19439C"></div>
                    <div class="color-button" data-color="#511B78" style="background-color:#511B78"></div>
                </div>
            </div>
        `
        let div = document.createElement('div')
        div.classList.add("toolbar-item","toolbar-drop-down","toolbar-color")
        div.innerHTML = html

        this.el.appendChild(div)

        this.fillButton = document.getElementById(id1)

        document.getElementById(id2).addEventListener('click',(event) => {
            stopPropagation(event)
            document.getElementById(id).style.display = 'block'
        })

        document.addEventListener('click',() => {
            document.getElementById(id).style.display = 'none'
        })
        
        document.getElementById(id).addEventListener('click',(e) => {
            let color = e.target.dataset.color
            document.getElementById(id).style.display = 'none'
            this.emit('changeFill',{
                data:color
            })
            this.fillButton.querySelector(".color-line").style.backgroundColor = color
        })
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
        this.textFillButton.querySelector(".color-line").style.backgroundColor = config.textFill
        this.fillButton.querySelector(".color-line").style.backgroundColor = config.fill
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