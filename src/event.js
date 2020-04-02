class Event {
    constructor(){
        this.handlers = {}
    }
    on(type,handler){
        if(typeof this.handlers[type] === "undefined"){
            this.handlers[type] = []
        }
        this.handlers[type].push(handler)
    }
    emit(event){
        if(!event.target){
            event.target = this
        }
        if(this.handlers[event.type] instanceof Array){
            const handlers = this.handlers[event.type]
            handlers.forEach((handler)=>{
                handler(event)
            })
        }
    }
    off(type,handler){
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
}

export default Event