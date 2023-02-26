export function createVNode(type,props?,children?) {

    const vnode = {
        type,// app 的setup
        props,
        children
    }

    return vnode
    
}