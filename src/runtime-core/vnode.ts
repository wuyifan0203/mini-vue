import { ShapeFlag } from "../shared/ShapeFlag"
import { isObject } from "../shared/index";

export function createVNode(type,props?,children?) {

    const vnode = {
        type,// app 的setup
        props,
        children,
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

function getShapeFlag(type) {
    return typeof type === 'string' ? ShapeFlag.ELEMENT : ShapeFlag.STATEFUL_COMPONENT;
}