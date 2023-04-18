import { ShapeFlag } from "../shared/ShapeFlag";
import { createComponentInstance, setupComponent } from "./component"
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";

export function createRenderer(options) {
    const { createElement, insert, patchProp } = options

    function render(vnode, container) {
        //调用patch
        patch(vnode, container, null)
    }

    function patch(vnode, container, parentComponent) {
        // 如果类型为 HTMLElement则处理element
        // 如果为组件则处理组件
        // 处理组件 
        const { shapeFlag, type } = vnode;

        switch (type) {
            case Fragment:
                processFragment(vnode, container, parentComponent)
                break;
            case Text:
                processText(vnode, container)
                break;

            default:
                if (shapeFlag & ShapeFlag.ELEMENT) {
                    processElement(vnode, container, parentComponent);
                } else if (shapeFlag & ShapeFlag.STATEFUL_COMPONENT) {
                    processComponent(vnode, container, parentComponent);
                }
                break;
        }

    }

    function processFragment(vnode: any, container: any, parentComponent) {
        vnode.children.forEach(v => patch(v, container, parentComponent))
    }

    function processText(vnode: any, container: any) {
        const textNode = vnode.el = document.createTextNode(vnode.children);
        container.append(textNode);
    }

    function processElement(vnode, container, parentComponent) {
        mountElement(vnode, container, parentComponent);
    }

    function mountElement(vnode: any, container: any, parentComponent) {
        const { type, children, props, shapeFlag } = vnode
        const el: HTMLElement = vnode.el = createElement(type);

        if (shapeFlag & ShapeFlag.TEXT_CHILDREN) {
            el.textContent = children;
        } else if (shapeFlag & ShapeFlag.ARRAY_CHILDREN) {
            children.forEach(v => patch(v, el, parentComponent));
        }


        for (const key in props) {
            patchProp(el, key, props[key])
        }

        insert(container, el)
    }



    function processComponent(vnode, container, parentComponent) {
        // 挂载组件
        mountCompnent(vnode, container, parentComponent);
    }

    function mountCompnent(initialVnode, container, parentComponent) {
        // 创建组件实例
        const instance = createComponentInstance(initialVnode, parentComponent);


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
        patch(subTree, container, instance);

        initialVnode.el = subTree.el;
    }

    return {
        createApp: createAppAPI(render)
    }
}





