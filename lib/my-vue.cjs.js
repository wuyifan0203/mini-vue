'use strict';

const isObject = value => value !== null && typeof value === 'object';

function createComponentInstance(vnode) {
    //创建对象实例
    const component = {
        vnode,
        type: vnode.type
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
    const { setup } = component;
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
    console.log(vnode.type);
    if (typeof vnode.type === 'string') {
        processElement(vnode, container);
    }
    else if (isObject(vnode.type)) {
        processComponent(vnode, container);
    }
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    const { type, children, props } = vnode;
    const el = document.createElement(type);
    if (typeof children === 'string') {
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
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
function mountCompnent(vnode, container) {
    // 创建组件实例
    const instance = createComponentInstance(vnode);
    // 配置组件 获取到render函数和setup函数的运行结果，挂载到实例上
    setupComponent(instance);
    // 处理渲染逻辑
    setupRenderEffect(instance, container);
}
function setupRenderEffect(instance, container) {
    // 生成虚拟节点树
    const subTree = instance.render();
    // 现在已经将组件转化为vnode
    // 变成vnode后由patch进行处理
    // vnode -> element -> mouuntElement
    patch(subTree, container);
}

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children
    };
    return vnode;
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

exports.createApp = createApp;
exports.h = h;
