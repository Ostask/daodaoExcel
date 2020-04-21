import { v4 as uuidv4 } from 'uuid';

/*
* 生成唯一id
*/
export function generateUUID(){
    let id = uuidv4()
    return id
}

/*
*判断滚轮方向  return true 为正，false 为负
*/
export function mouseWheelDirection(e){
    e = e || window.event;
    if (e.wheelDelta) {  //判断浏览器IE，谷歌滑轮事件            
        if (e.wheelDelta > 0) { //当滑轮向上滚动时
            return true
        }
        if (e.wheelDelta < 0) { //当滑轮向下滚动时
            return false
        }
    } else if (e.detail) {  //Firefox滑轮事件
        if (e.detail> 0) { //当滑轮向上滚动时
            return false
        }
        if (e.detail< 0) { //当滑轮向下滚动时
            return true
        }
    }
}

/*
*阻止默认事件
*/
export function preventDefault(event){
    if (event.preventDefault){
        event.preventDefault();
    }else{
        event.returnValue=false;
    }
}

/*
*阻止冒泡和捕获
*/
export function stopPropagation(event){
    if(event && event.stopPropagation) {
        event.stopPropagation();    // W3C标准
    }else {
        event.cancelBubble = true;  //ie678
    }
}

/*
*生成26进制的A-F序号
*/
export function generateCode(number){
    let letter = [
        'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
    ]
    let code = ''
    let num = number
    code += letter[num % 26];
    num = Math.floor(num/26);
    while(num > 0){
        code += letter[num % 26 - 1];
        num = Math.floor(num/26);
    }
    return code.split('').reverse().join('')
}
