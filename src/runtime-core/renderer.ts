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
        patch(null, vnode, container, null, null)
    }

    function patch(n1, n2, container, parentComponent, anchor) {
        // 如果类型为 HTMLElement则处理element
        // 如果为组件则处理组件
        // 处理组件 
        const { shapeFlag, type } = n2;
        // n2是新的
        // n1是旧的

        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent, anchor)
                break;
            case Text:
                processText(n1, n2, container)
                break;

            default:
                if (shapeFlag & ShapeFlag.ELEMENT) {
                    processElement(n1, n2, container, parentComponent, anchor);
                } else if (shapeFlag & ShapeFlag.STATEFUL_COMPONENT) {
                    processComponent(n1, n2, container, parentComponent, anchor);
                }
                break;
        }

    }

    function processFragment(n1, n2: any, container: any, parentComponent, anchor) {
        if (!n1) {
            mountChildren(n2.children, container, parentComponent, anchor)
        }
    }

    function processText(n1: any, n2: any, container: any) {
        const textNode = n2.el = document.createTextNode(n2.children);
        container.append(textNode);
    }

    function processElement(n1, n2, container, parentComponent, anchor) {
        if (!n1) {
            // n1 为空是第一次初始化
            mountElement(n2, container, parentComponent, anchor);
        } else {
            patchElement(n1, n2, container, parentComponent, anchor)
        }
    }

    function patchElement(n1, n2, container, parentComponent, anchor) {
        console.log('patchElement');
        console.log('old', n1);
        console.log('new', n2);


        const oldProps = n1.props || EMPTY_OBJ;
        const newProps = n2.props || EMPTY_OBJ;

        const el = (n2.el = n1.el);

        // 对比props
        patchProps(el, oldProps, newProps);
        // 对比孩子
        patchChildren(n1, n2, el, parentComponent, anchor)

    }

    function patchChildren(n1, n2, container, parentComponent, anchor) {
        const oldShapeFlag = n1.shapeFlag;
        const newShapeFlag = n2.shapeFlag;
        const oldChildren = n1.children;
        const newChildren = n2.children;


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
                mountChildren(newChildren, container, parentComponent, anchor)
            } else {
                // 老的是Array新的还是Array
                patchKeyedChildren(oldChildren, newChildren, container, parentComponent, anchor)
            }
        }

    }

    function patchKeyedChildren(oldChildren, newChildren, container, parentComponent, parrentAnchor) {
        console.log('newChildren ->', newChildren);
        console.log('oldChildren -> ', oldChildren);

        let i = 0;
        const newChildrenLength = newChildren.length
        let oldIndex = oldChildren.length - 1
        let newIndex = newChildrenLength - 1;

        function isSameVNodeType(child1, child2) {
            // 判断依据，type 和 key
            return child1.type === child2.type && child1.key === child2.key
        }

        // 左侧对比
        while (i <= oldIndex && i <= newIndex) {
            const oldNodeChild = oldChildren[i];
            const newNodeChild = newChildren[i];

            if (isSameVNodeType(oldNodeChild, newNodeChild)) {
                patch(oldNodeChild, newNodeChild, container, parentComponent, parrentAnchor)
            } else {
                break;
            }
            i++;
        }

        // 右侧对比
        while (i <= oldIndex && i <= newIndex) {
            const oldNodeChild = oldChildren[oldIndex];
            const newNodeChild = newChildren[newIndex];

            if (isSameVNodeType(oldNodeChild, newNodeChild)) {
                patch(oldNodeChild, newNodeChild, container, parentComponent, parrentAnchor)
            } else {
                break;
            }
            oldIndex--;
            newIndex--;
        }

        // 新的比老的多,需要创建
        if (i > oldIndex) {
            if (i <= newIndex) {
                const nextPostion = newIndex + 1;
                const anchor = nextPostion < newChildrenLength ? newChildren[nextPostion].el : null;
                while (i <= newIndex) {
                    patch(null, newChildren[i], container, parentComponent, anchor);
                    i++
                }
            }
        } else if (i > newIndex) {
            // 老的比新的长，需要删除
            while (i <= oldIndex) {
                hostRemove(oldChildren[i].el);
                i++;
            }
        } else {
            // 中间对比
            const oldIndexStart = i
            const newIndexStart = i;

            // 遍历 newChidren 建立中间部分的索引Map，方便与旧的对比
            const keyToIndexMap = new Map();
            for (let i = newIndexStart; i <= newIndex; i++) {
                const nextChild = newChildren[i];
                keyToIndexMap.set(nextChild.key, i);
            }

            // 一共需要patch多少个新节点
            const toBePatched = newIndex - newIndexStart + 1;
            // 已经patched的节点数量
            let hasBeenPatched = 0;
            let middleNewIndex;
            // 遍历旧的中间部分做对比
            for (let i = oldIndexStart; i <= oldIndex; i++) {
                const prevChild = oldChildren[i];

                // 当新patched数量大于等于应该patch的数量
                // 说明其余的节点多余，可以直接删除，不需要对比
                if (hasBeenPatched >= toBePatched) {
                    hostRemove(prevChild.el);
                    continue;
                }

                // 如果老节点有 key 则从表中查询对比
                if (prevChild?.key != null) {
                    middleNewIndex = keyToIndexMap.get(prevChild.key);
                } else {
                    // 如果老的节点没有 key 则需要依次遍历对比，
                    for (let j = newIndexStart; j < newIndex; j++) {
                        if (isSameVNodeType(prevChild, newChildren[j])) {
                            middleNewIndex = j;
                            break;
                        }
                    }
                }

                // 如果没有索引，说明老的有，新的没有，该删除
                if (middleNewIndex === undefined) {
                    hostRemove(prevChild.el)
                } else {
                    // 如果存在则更新挂载
                    patch(prevChild, newChildren[middleNewIndex], container, parentComponent, null);
                    // 记录patch次数
                    hasBeenPatched++;
                }

            }
        }
    }

    function mountChildren(children, container, parentComponent, anchor) {
        children.forEach(v => patch(null, v, container, parentComponent, anchor))
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

    function mountElement(vnode: any, container: any, parentComponent, anchor) {
        const { type, children, props, shapeFlag } = vnode
        const el: HTMLElement = vnode.el = hostCreateElement(type);

        if (shapeFlag & ShapeFlag.TEXT_CHILDREN) {
            el.textContent = children;
        } else if (shapeFlag & ShapeFlag.ARRAY_CHILDREN) {
            mountChildren(children, el, parentComponent, anchor)
        }


        for (const key in props) {
            hostPatchProp(el, key, null, props[key])
        }

        hostInsert(el, container, anchor)
    }



    function processComponent(n1, n2, container, parentComponent, anchor) {
        // 挂载组件
        mountCompnent(n2, container, parentComponent, anchor);
    }

    function mountCompnent(initialVnode, container, parentComponent, anchor) {
        // 创建组件实例
        const instance = createComponentInstance(initialVnode, parentComponent);


        // 配置组件 获取到render函数和setup函数的运行结果，挂载到实例上
        setupComponent(instance);

        // 处理渲染逻辑
        setupRenderEffect(instance, initialVnode, container, anchor)

    }


    function setupRenderEffect(instance, initialVnode, container, anchor) {
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
                patch(null, subTree, container, instance, anchor);
                initialVnode.el = subTree.el;
                instance.isMounted = true;
            } else {
                // update
                console.log('update');
                // 获取之前的subtree
                const { proxy, subTree: prevSubTree } = instance;
                const subTree = instance.render.call(proxy);
                // 将最新的根节点更新

                patch(prevSubTree, subTree, container, instance, anchor);
                instance.subTree = subTree;
            }
        })
    }

    return {
        createApp: createAppAPI(render)
    }
}





