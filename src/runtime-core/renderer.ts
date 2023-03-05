import { isObject, isOn } from "../shared/index";
import { ShapeFlag } from "../shared/ShapeFlag";
import { createComponentInstance, setupComponent } from "./conponent"

export function render(vnode, container) {
    //调用patch

    patch(vnode, container)

}

export function patch(vnode, container) {
    // 如果类型为 HTMLElement则处理element
    // 如果为组件则处理组件
    // 处理组件 
    const { shapeFlag } = vnode;
    if (shapeFlag & ShapeFlag.ELEMENT) {
        processElement(vnode, container)
    } else if (shapeFlag & ShapeFlag.STATEFUL_COMPONENT) {
        processComponent(vnode, container)
    }


}

function processElement(vnode, container) {
    mountElement(vnode, container)
}

function mountElement(vnode: any, container: any) {
    const { type, children, props ,shapeFlag} = vnode
    const el:HTMLElement = vnode.el = document.createElement(type);

    if (shapeFlag & ShapeFlag.TEXT_CHILDREN) {
        el.textContent = children;
    } else if (shapeFlag & ShapeFlag.ARRAY_CHILDREN) {
        children.forEach(v => patch(v, el))
    }


    for (const key in props) {
        if(isOn(key)){
            const event = key.slice(2).toLowerCase();
            el.addEventListener(event,props[key]);
        }else{
            if(key === 'class'){
                const val = props[key].join(' ')
                el.setAttribute(key, val);
            }else{
                el.setAttribute(key, props[key])
            }
        }
    }

    container.append(el)
}



function processComponent(vnode, container) {
    // 挂载组件
    mountCompnent(vnode, container)
}

function mountCompnent(initialVnode, container) {
    // 创建组件实例
    const instance = createComponentInstance(initialVnode);


    // 配置组件 获取到render函数和setup函数的运行结果，挂载到实例上
    setupComponent(instance);

    // 处理渲染逻辑
    setupRenderEffect(instance, initialVnode, container)

}


function setupRenderEffect(instance, initialVnode, container) {
    const { proxy } = instance
    // 生成虚拟节点树
    // 绑定 this
    const subTree = instance.render.call(proxy);
    // 现在已经将组件转化为vnode,subTree为vnode 
    // 变成vnode后由patch进行处理
    // vnode -> element -> mouuntElement
    patch(subTree, container);

    initialVnode.el = subTree.el;
}




