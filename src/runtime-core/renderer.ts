import { createComponentInstance, setupComponent } from "./conponent"

export function render(vnode,container) {
    //调用patch

    patch(vnode,container)
    
}

export function patch(vnode,container) {
    // 处理组件 
    processComponent(vnode,container)
    
}


function processComponent(vnode,container) {
    // 挂载组件
    mountCompnent(vnode,container)
}

function mountCompnent(vnode,container) {
    // 创建组件实例
    const instance = createComponentInstance(vnode);


    // 配置组件 获取到render函数和setup函数的运行结果，挂载到实例上
    setupComponent(instance);

    // 处理渲染逻辑
    setupRenderEffect(instance,container)

}


function setupRenderEffect(instance,container) {
    // 生成虚拟节点树
    const subTree = instance.render(); 
    // 现在已经将组件转化为vnode
    // 变成vnode后由patch进行处理
    // vnode -> element -> mouuntElement
    patch(subTree,container);
}

