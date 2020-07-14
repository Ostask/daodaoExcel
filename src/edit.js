import Event from './event.js'

class Edit extends Event{
    constructor(parent){
        super()
        //编辑框的dom元素
        this.editEle = null
        this.editFlag = false
        this.init(parent)
    }
    init(parent){
        //初始化编辑框
        this.editEle = document.createElement('div')
        this.editEle.id = "daodao_excel_edit_div"
        this.editEle.style.cssText = `
            position:absolute;
            text-indent:2px;
            outline-color:transparent;
            display:none;
            background:#fff;
            border:1px solid #4e9fff;
        `
        this.editEle.setAttribute("contenteditable", "true");
        parent.appendChild(this.editEle)
    }
    //改变编辑框的位置和大小
    setPosition(width,height,positionX,positionY,data){
        this.editEle.style.width = `${width - 2}px`
        this.editEle.style.minHeight = `${height - 2}px`
        this.editEle.style.top = `${positionY}px`
        this.editEle.style.left = `${positionX}px`
        this.editEle.textContent = data
        this.showEdit()
        this.editEle.focus()
    }
    hideEdit(){
        if(!this.editFlag){
            return false
        }
        this.emit('update',{
            type:'text',
            text:this.editEle.textContent
        })
        this.editEle.style.display = "none"
        this.editFlag = false
        this.clearInput()
    }
    showEdit(){
        this.editEle.style.display = "block"
        this.editFlag = true
    }
    clearInput(){
        this.editEle.innerHTML = " "
    }
}

export default Edit