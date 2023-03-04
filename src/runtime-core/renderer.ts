import { isObject } from "../shared/index";
import { createComponentInstance, setupComponent } from "./conponent"

export function render(vnode,container) {
    //调用patch

    patch(vnode,container)
    
}

export function patch(vnode,container) {
    // 如果类型为 HTMLElement则处理element
    // 如果为组件则处理组件
    // 处理组件 
    if (typeof vnode.type === 'string') {
        processElement(vnode,container)
    }else if(isObject(vnode.type)){
        processComponent(vnode,container)
    }

    
}

function processElement(vnode,container) {
    mountElement(vnode,container)
}

function mountElement(vnode: any, container: any) {
    const {type,children,props} = vnode
    const el = vnode.el = document.createElement(type);

    if(typeof children === 'string'){
        el.textContent = children;
    }else if(Array.isArray(children)){
        children.forEach(v=>patch(v,el))
    }


    for (const key in props) {
        el.setAttribute(key,props[key])  
    }

    container.append(el)
}



function processComponent(vnode,container) {
    // 挂载组件
    mountCompnent(vnode,container)
}

function mountCompnent(initialVnode,container) {
    // 创建组件实例
    const instance = createComponentInstance(initialVnode);


    // 配置组件 获取到render函数和setup函数的运行结果，挂载到实例上
    setupComponent(instance);

    // 处理渲染逻辑
    setupRenderEffect(instance,initialVnode,container)

}


function setupRenderEffect(instance,initialVnode,container) {
    const {proxy} = instance
    // 生成虚拟节点树
    // 绑定 this
    const subTree = instance.render.call(proxy); 
    // 现在已经将组件转化为vnode,subTree为vnode 
    // 变成vnode后由patch进行处理
    // vnode -> element -> mouuntElement
    patch(subTree,container);

    initialVnode.el = subTree.el;    
}




