import Event from "./event.js"

class UploadFile extends Event{
    constructor(parent){
        super()
        this.el = null
        this.init(parent)
    }
    init(parent){
        this.el = document.createElement('input')
        this.el.type = 'file'
        this.el.accept = 'image/*'
        this.el.style.display = 'none'
        parent.appendChild(this.el)
        this.el.addEventListener('change',(e) => {
           let file = this.el.files[0]
           let reader = new FileReader()
           reader.onload = () => {
               this.emit('changeImage',{url:reader.result})
               this.el.value = ''
           }
           reader.readAsDataURL(file)
        })
    }
    open(){
        this.el.click()
    }
}

export default UploadFile