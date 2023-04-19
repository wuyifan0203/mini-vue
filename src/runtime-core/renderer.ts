import { effect } from "../reactivity";
import { ShapeFlag } from "../shared/ShapeFlag";
import { createComponentInstance, setupComponent } from "./component"
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";

export function createRenderer(options) {
    const { createElement, insert, patchProp } = options

    function render(vnode, container) {
        //调用patch
        patch(null,vnode, container, null)
    }

    function patch(n1,n2, container, parentComponent) {
        // 如果类型为 HTMLElement则处理element
        // 如果为组件则处理组件
        // 处理组件 
        const { shapeFlag, type } = n2;

        switch (type) {
            case Fragment:
                processFragment(n1,n2, container, parentComponent)
                break;
            case Text:
                processText(n1,n2,container)
                break;

            default:
                if (shapeFlag & ShapeFlag.ELEMENT) {
                    processElement(n1,n2,container, parentComponent);
                } else if (shapeFlag & ShapeFlag.STATEFUL_COMPONENT) {
                    processComponent(n1,n2,container, parentComponent);
                }
                break;
        }

    }

    function processFragment(n1,n2: any, container: any, parentComponent) {
        n2.children.forEach(v => patch(n1,v, container, parentComponent))
    }

    function processText(n1:any,n2: any, container: any) {
        const textNode = n2.el = document.createTextNode(n2.children);
        container.append(textNode);
    }

    function processElement(n1,n2, container, parentComponent) {
        if(!n1){
            mountElement(n2, container, parentComponent);
        }else {
            patchElement(n1,n2,container)
        }
    }

    function patchElement(n1,n2,container) {
        console.log('patchElement');
        console.log('current',n1);
        console.log('prev',n2);
    }

    function mountElement(vnode: any, container: any, parentComponent) {
        const { type, children, props, shapeFlag } = vnode
        const el: HTMLElement = vnode.el = createElement(type);

        if (shapeFlag & ShapeFlag.TEXT_CHILDREN) {
            el.textContent = children;
        } else if (shapeFlag & ShapeFlag.ARRAY_CHILDREN) {
            children.forEach(v => patch(null,v, el, parentComponent));
        }


        for (const key in props) {
            patchProp(el, key, props[key])
        }

        insert(container, el)
    }



    function processComponent(n1,n2, container, parentComponent) {
        // 挂载组件
        mountCompnent(n2, container, parentComponent);
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
        effect(()=>{
            if(!instance.isMounted){
                // init
                console.log('init');
                const { proxy } = instance
                // 生成虚拟节点树
                // 绑定 this
                const subTree =(instance.subTree = instance.render.call(proxy));
                // 现在已经将组件转化为vnode,subTree为vnode 
                // 变成vnode后由patch进行处理
                // vnode -> element -> mouuntElement
                patch(null,subTree, container, instance);
                initialVnode.el = subTree.el;
                instance.isMounted = true;
            }else {
                // update
                console.log('update');
                const { proxy } = instance
                const subTree = instance.render.call(proxy);
                patch(subTree,instance.subTree, container, instance);
                instance.subTree = subTree;
            }
        })
    }

    return {
        createApp: createAppAPI(render)
    }
}





