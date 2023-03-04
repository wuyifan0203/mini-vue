export function createVNode(type,props?,children?) {

    const vnode = {
        type,// app 的setup
        props,
        children,
        el:null //根组件节点
    }

    return vnode
    
}