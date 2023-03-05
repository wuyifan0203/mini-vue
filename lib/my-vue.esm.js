const publicPropertiesMap = {
    $el: (instance) => instance.vnode.el
};
const PublicInstanceProxyHandles = {
    get({ '_': instance }, key) {
        const { setupState } = instance;
        if (key in setupState) {
            return setupState[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

function createComponentInstance(vnode) {
    //创建对象实例
    const component = {
        vnode,
        type: vnode.type,
        setupState: {}
    };
    return component;
}
function setupComponent(instance) {
    // 初始化
    // initProps
    // initSlots
    // 配置有状态的组件
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const component = instance.type;
    // 代理this
    instance.proxy = new Proxy({ '_': instance }, PublicInstanceProxyHandles);
    const { setup } = component; // type 为component
    // 可能没有setup
    if (setup) {
        const setupResult = setup();
        // 处理 setup 返回结果
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // result 可以是函数，也可以是对象
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const component = instance.type;
    // if(component.render){
    instance.render = component.render;
    // }
}

function render(vnode, container) {
    //调用patch
    patch(vnode, container);
}
function patch(vnode, container) {
    // 如果类型为 HTMLElement则处理element
    // 如果为组件则处理组件
    // 处理组件 
    const { shapeFlag } = vnode;
    if (shapeFlag & 1 /* ShapeFlag.ELEMENT */) {
        processElement(vnode, container);
    }
    else if (shapeFlag & 2 /* ShapeFlag.STATEFUL_COMPONENT */) {
        processComponent(vnode, container);
    }
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    const { type, children, props, shapeFlag } = vnode;
    const el = vnode.el = document.createElement(type);
    if (shapeFlag & 4 /* ShapeFlag.TEXT_CHILDREN */) {
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* ShapeFlag.ARRAY_CHILDREN */) {
        children.forEach(v => patch(v, el));
    }
    for (const key in props) {
        el.setAttribute(key, props[key]);
    }
    container.append(el);
}
function processComponent(vnode, container) {
    // 挂载组件
    mountCompnent(vnode, container);
}
function mountCompnent(initialVnode, container) {
    // 创建组件实例
    const instance = createComponentInstance(initialVnode);
    // 配置组件 获取到render函数和setup函数的运行结果，挂载到实例上
    setupComponent(instance);
    // 处理渲染逻辑
    setupRenderEffect(instance, initialVnode, container);
}
function setupRenderEffect(instance, initialVnode, container) {
    const { proxy } = instance;
    // 生成虚拟节点树
    // 绑定 this
    const subTree = instance.render.call(proxy);
    // 现在已经将组件转化为vnode,subTree为vnode 
    // 变成vnode后由patch进行处理
    // vnode -> element -> mouuntElement
    patch(subTree, container);
    initialVnode.el = subTree.el;
}

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        shapeFlag: getShapeFlag(type),
        el: null //根组件节点
    };
    if (typeof children === 'string') {
        vnode.shapeFlag = vnode.shapeFlag | 4 /* ShapeFlag.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag = vnode.shapeFlag | 8 /* ShapeFlag.ARRAY_CHILDREN */;
    }
    return vnode;
}
function getShapeFlag(type) {
    return typeof type === 'string' ? 1 /* ShapeFlag.ELEMENT */ : 2 /* ShapeFlag.STATEFUL_COMPONENT */;
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 1.现转化为vnode
            // 2.对node做处理
            const vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

export { createApp, h };
