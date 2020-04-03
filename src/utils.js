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