/*
 * @Author: wuyifan 1208097313@qq.com
 * @Date: 2023-02-23 23:57:40
 * @LastEditors: wuyifan 1208097313@qq.com
 * @LastEditTime: 2023-05-03 01:15:43
 * @FilePath: /my-vue/src/runtime-core/vnode.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { ShapeFlag } from "../shared/ShapeFlag"
import { isObject } from "../shared/index";

export const Fragment = Symbol('Fragment');
export const Text = Symbol('Text');

export function createVNode(type,props?,children?) {

    const vnode = {
        type,// app 的setup
        props,
        children,
        key: props && props.key,
        shapeFlag:getShapeFlag(type),
        el:null //根组件节点
    }

    if(typeof children === 'string'){
        vnode.shapeFlag = vnode.shapeFlag | ShapeFlag.TEXT_CHILDREN;
    }else if (Array.isArray(children)){
        vnode.shapeFlag = vnode.shapeFlag | ShapeFlag.ARRAY_CHILDREN;
    }

    // 处理slot
    if(vnode.shapeFlag & ShapeFlag.STATEFUL_COMPONENT){
        if(isObject(children)){
            vnode.shapeFlag = vnode.shapeFlag | ShapeFlag.SLOT_CHILDREN
        }
    }

    return vnode
    
}

export function createTextVNode(text:string) {
    return createVNode(Text,{},text)
}

function getShapeFlag(type) {
    return typeof type === 'string' ? ShapeFlag.ELEMENT : ShapeFlag.STATEFUL_COMPONENT;
}