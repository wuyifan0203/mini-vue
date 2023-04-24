import { effect } from "../reactivity";
import { EMPTY_OBJ } from "../shared";
import { ShapeFlag } from "../shared/ShapeFlag";
import { createComponentInstance, setupComponent } from "./component"
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";

export function createRenderer(options) {
    const {
        createElement: hostCreateElement,
        insert: hostInsert,
        patchProp: hostPatchProp,
        remove: hostRemove,
        setElementText: hostSetElementText
    } = options

    function render(vnode, container) {
        //调用patch
        patch(null, vnode, container, null)
    }

    function patch(n1, n2, container, parentComponent) {
        // 如果类型为 HTMLElement则处理element
        // 如果为组件则处理组件
        // 处理组件 
        const { shapeFlag, type } = n2;

        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent)
                break;
            case Text:
                processText(n1, n2, container)
                break;

            default:
                if (shapeFlag & ShapeFlag.ELEMENT) {
                    processElement(n1, n2, container, parentComponent);
                } else if (shapeFlag & ShapeFlag.STATEFUL_COMPONENT) {
                    processComponent(n1, n2, container, parentComponent);
                }
                break;
        }

    }

    function processFragment(n1, n2: any, container: any, parentComponent) {
        n2.children.forEach(v => patch(n1, v, container, parentComponent))
    }

    function processText(n1: any, n2: any, container: any) {
        const textNode = n2.el = document.createTextNode(n2.children);
        container.append(textNode);
    }

    function processElement(n1, n2, container, parentComponent) {
        if (!n1) {
            // n1 为空是第一次初始化
            mountElement(n2, container, parentComponent);
        } else {
            patchElement(n1, n2, container,parentComponent)
        }
    }

    function patchElement(n1, n2, container,parentComponent) {
        console.log('patchElement');
        console.log('new', n1);
        console.log('old', n2);

        const oldProps = n2.props || EMPTY_OBJ;
        const newProps = n1.props || EMPTY_OBJ;
        const el = n1.el = n2.el;
        patchChildren(n1, n2, el,parentComponent)
        patchProps(el, oldProps, newProps)
    }

    function patchChildren(n1, n2, container,parentComponent) {
        const oldShapeFlag = n2.shapeFlag;
        const newShapeFlag = n1.shapeFlag;
        const oldChildren = n2.children;
        const newChildren = n1.children;


        if (newShapeFlag & ShapeFlag.TEXT_CHILDREN) {
            // 老的是数组，新的是text
            if (oldShapeFlag & ShapeFlag.ARRAY_CHILDREN) {
                // 1.清除老的
                unmountChildren(oldChildren)
                // 2.设置新的
                hostSetElementText(container, newChildren)
            } else {
                // 老的是Text 新的也是Text
                if (oldChildren !== newChildren) {
                    hostSetElementText(container, newChildren)
                }
            }
        } else {
            // 老的是Text 新的是数组
            if (oldShapeFlag & ShapeFlag.TEXT_CHILDREN) {
                // 1.清除老的Text
                hostSetElementText(container, '')
                // 2.设置新的
                mountChildren(newChildren,container,parentComponent)
            }
        }

    }

    function mountChildren(children,container,parentComponent) {
        children.forEach(v => patch(null, v, container, parentComponent))
    }

    function unmountChildren(children) {
        for (let index = 0; index < children.length; index++) {
            const element = children[index].el;
            // 删除
            hostRemove(element);

        }

    }

    function patchProps(el, oldProps, newProps) {
        if (oldProps !== newProps) {
            for (const key in newProps) {
                const oldProp = oldProps[key];
                const newProp = newProps[key];
                if (oldProp !== newProp) {
                    hostPatchProp(el, key, oldProp, newProp)
                }
            }
            if (oldProps !== EMPTY_OBJ) {
                for (const key in oldProps) {
                    if (!(key in newProps)) {
                        hostPatchProp(el, key, oldProps[key], null)
                    }
                }
            }
        }
    }

    function mountElement(vnode: any, container: any, parentComponent) {
        const { type, children, props, shapeFlag } = vnode
        const el: HTMLElement = vnode.el = hostCreateElement(type);

        if (shapeFlag & ShapeFlag.TEXT_CHILDREN) {
            el.textContent = children;
        } else if (shapeFlag & ShapeFlag.ARRAY_CHILDREN) {
            children.forEach(v => patch(null, v, el, parentComponent));
        }


        for (const key in props) {
            hostPatchProp(el, key, null, props[key])
        }

        hostInsert(container, el)
    }



    function processComponent(n1, n2, container, parentComponent) {
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
        effect(() => {
            if (!instance.isMounted) {
                // init
                console.log('init');
                const { proxy } = instance
                // 生成虚拟节点树
                // 绑定 this
                const subTree = (instance.subTree = instance.render.call(proxy));
                // 现在已经将组件转化为vnode,subTree为vnode 
                // 变成vnode后由patch进行处理
                // vnode -> element -> mouuntElement
                patch(null, subTree, container, instance);
                initialVnode.el = subTree.el;
                instance.isMounted = true;
            } else {
                // update
                console.log('update');
                const { proxy } = instance
                const subTree = instance.render.call(proxy);
                patch(subTree, instance.subTree, container, instance);
                instance.subTree = subTree;
            }
        })
    }

    return {
        createApp: createAppAPI(render)
    }
}





