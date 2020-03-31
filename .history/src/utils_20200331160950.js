import { v4 as uuidv4 } from 'uuid';

/*
* 生成唯一id
*/
export function generateUUID(){
    let id = uuidv4()
    return id
}