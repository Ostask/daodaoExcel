class ContextMenu {
    constructor(parent){
        this.menus = [
           
        ]
        this.menuEl = null
        this.init(parent)
    }
    init(parent){
        //创建右键菜单dom
        this.menuEl = document.createElement('div')
        this.menuEl.id = "daodao_excel_menu"
        this.menuEl.style.cssText = `
            position:absolute;
            padding:2px;
            width:150px;
            display:none;
            background:#fff;
            border:1px solid #d2d2d2;
        `
        parent.appendChild(this.menuEl)
    }
    showMenu(x,y){
        this.menuEl.style.display = "block"
        this.menuEl.style.top = y + 'px'
        this.menuEl.style.left = x + 'px'
    }
    hideMenu(){
        this.menuEl.style.display = "none"
    }
    addButton(name,func){
        let btn = document.createElement('div')
        btn.innerText = name
        btn.style.cssText = `
            cursor: pointer;
            padding: 4px;
            color: #6b6b6b;
            font-size: 14px;
        `
        this.menuEl.appendChild(btn)
        this.menus.push(btn)
        btn.addEventListener("click",func)
        return btn
    }
}

export default ContextMenu