'use strict';

const extend = Object.assign;
const isObject = value => value !== null && typeof value === 'object';
const isOn = (key) => /^on[A-Z]/.test(key);
const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);
const capitalize = (key) => key.charAt(0).toUpperCase() + key.slice(1);
const toHadelKey = (key) => key ? 'on' + capitalize(key) : '';
const camelize = (key) => key.replace(/-(\w)/g, (_, c) => c ? c.toUpperCase() : '');

const Fragment = Symbol('Fragment');
const Text = Symbol('Text');
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
    // 处理slot
    if (vnode.shapeFlag & 2 /* ShapeFlag.STATEFUL_COMPONENT */) {
        if (isObject(children)) {
            vnode.shapeFlag = vnode.shapeFlag | 16 /* ShapeFlag.SLOT_CHILDREN */;
        }
    }
    return vnode;
}
function createTextVNode(text) {
    return createVNode(Text, {}, text);
}
function getShapeFlag(type) {
    return typeof type === 'string' ? 1 /* ShapeFlag.ELEMENT */ : 2 /* ShapeFlag.STATEFUL_COMPONENT */;
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

function renderSlots(slots, key, params) {
    const slot = slots[key];
    if (slot) {
        if (typeof slot === 'function') {
            return createVNode(Fragment, {}, slot(params));
        }
    }
}

const targetMap = new Map();
function trigger(target, key) {
    let depMap = targetMap.get(target);
    let dep = depMap.get(key);
    triggerEffect(dep);
}
function triggerEffect(dep) {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
//只要对象 . 会调用get方法
function createGetter(isReadonly = false, isShallowReadonly = false) {
    return function get(target, key) {
        if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* ReactiveFlags.IS_READONLY */) {
            return isReadonly;
        }
        // res 为对象的实际指 -> target[key]
        const res = Reflect.get(target, key);
        if (isShallowReadonly) {
            return res;
        }
        // res类型为object则转化为reactive
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
// 对象做 = 赋值操做，就会调用set方法
function createSetter() {
    return function set(target, key, value) {
        // res 为 boolean
        const res = Reflect.set(target, key, value);
        // 触发依赖
        trigger(target, key);
        return res;
    };
}
const mutableHandlers = {
    get,
    set
};
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key, value) {
        console.warn(`key ${key} cant't be set , because target is readonly object.`, target);
        return true;
    }
};
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet
});

function createReactiveObject(raw, baseHandler) {
    return new Proxy(raw, baseHandler);
}
function reactive(raw) {
    return createReactiveObject(raw, mutableHandlers);
}
function readonly(raw) {
    return createReactiveObject(raw, readonlyHandlers);
}
function shallowReadonly(raw) {
    if (!isObject(raw)) {
        console.warn(`target ${raw} is not Object`);
        return raw;
    }
    return createReactiveObject(raw, shallowReadonlyHandlers);
}

function initProps(instance, origonProps) {
    instance.props = origonProps || {};
}

const publicPropertiesMap = {
    $el: (instance) => instance.vnode.el,
    $slots: (instance) => instance.slots,
};
const PublicInstanceProxyHandles = {
    get({ '_': instance }, key) {
        const { setupState, props } = instance;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

function initSlots(instance, children) {
    // 不是所有都拥有slot
    if (instance.vnode.shapeFlag & 16 /* ShapeFlag.SLOT_CHILDREN */) {
        const slots = {};
        for (const key in children) {
            const value = children[key]; // 这是一个函数，调用返回一个vnode
            slots[key] = (props) => {
                const slotVnode = value(props);
                return Array.isArray(slotVnode) ? slotVnode : [slotVnode];
            };
        }
        instance.slots = slots;
    }
}

function emit(instance, eventName, ...arg) {
    console.log(eventName);
    const { props } = instance;
    const handler = props[toHadelKey(camelize(eventName))];
    handler && handler(...arg);
}

function createComponentInstance(vnode, parent) {
    //创建对象实例
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        provides: (parent === null || parent === void 0 ? void 0 : parent.provides) ? parent.provides : {},
        parent,
        emit: () => { }
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    // 初始化
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
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
        currentInstance = instance;
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        });
        currentInstance = null;
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
let currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}

function provide(key, value) {
    var _a;
    // 存
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        const parentProvides = (_a = currentInstance.parent) === null || _a === void 0 ? void 0 : _a.provides;
        if (provides === parentProvides) {
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        provides[key] = value;
    }
}
function inject(key, defaultValue) {
    // 取
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const { parent } = currentInstance;
        if (key in (parent === null || parent === void 0 ? void 0 : parent.provides)) {
            return parent.provides[key];
        }
        else if (defaultValue) {
            if (typeof defaultValue === 'function') {
                return defaultValue();
            }
            else {
                return defaultValue;
            }
        }
    }
}

/*
 * @Author: wuyifan 1208097313@qq.com
 * @Date: 2023-02-23 23:52:25
 * @LastEditors: wuyifan 1208097313@qq.com
 * @LastEditTime: 2023-04-18 23:12:35
 * @FilePath: /my-vue/src/runtime-core/createApp.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                // 1.现转化为vnode
                // 2.对node做处理
                const vnode = createVNode(rootComponent);
                render(vnode, rootContainer);
            }
        };
    };
}

function createRenderer(options) {
    const { createElement, insert, patchProp } = options;
    function render(vnode, container) {
        //调用patch
        patch(vnode, container, null);
    }
    function patch(vnode, container, parentComponent) {
        // 如果类型为 HTMLElement则处理element
        // 如果为组件则处理组件
        // 处理组件 
        const { shapeFlag, type } = vnode;
        switch (type) {
            case Fragment:
                processFragment(vnode, container, parentComponent);
                break;
            case Text:
                processText(vnode, container);
                break;
            default:
                if (shapeFlag & 1 /* ShapeFlag.ELEMENT */) {
                    processElement(vnode, container, parentComponent);
                }
                else if (shapeFlag & 2 /* ShapeFlag.STATEFUL_COMPONENT */) {
                    processComponent(vnode, container, parentComponent);
                }
                break;
        }
    }
    function processFragment(vnode, container, parentComponent) {
        vnode.children.forEach(v => patch(v, container, parentComponent));
    }
    function processText(vnode, container) {
        const textNode = vnode.el = document.createTextNode(vnode.children);
        container.append(textNode);
    }
    function processElement(vnode, container, parentComponent) {
        mountElement(vnode, container, parentComponent);
    }
    function mountElement(vnode, container, parentComponent) {
        const { type, children, props, shapeFlag } = vnode;
        const el = vnode.el = createElement(type);
        if (shapeFlag & 4 /* ShapeFlag.TEXT_CHILDREN */) {
            el.textContent = children;
        }
        else if (shapeFlag & 8 /* ShapeFlag.ARRAY_CHILDREN */) {
            children.forEach(v => patch(v, el, parentComponent));
        }
        for (const key in props) {
            patchProp(el, key, props[key]);
        }
        insert(container, el);
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
        patch(subTree, container, instance);
        initialVnode.el = subTree.el;
    }
    return {
        createApp: createAppAPI(render)
    };
}

/*
 * @Author: wuyifan 1208097313@qq.com
 * @Date: 2023-04-17 23:44:17
 * @LastEditors: wuyifan 1208097313@qq.com
 * @LastEditTime: 2023-04-19 00:09:39
 * @FilePath: /my-vue/src/runtime-dom/index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
function createElement(type) {
    return document.createElement(type);
}
function patchProp(el, key, val) {
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, val);
    }
    else {
        if (key === 'class') {
            const value = val.join(' ');
            el.setAttribute(key, value);
        }
        else {
            el.setAttribute(key, val);
        }
    }
}
function insert(parent, el) {
    parent.append(el);
}
const renderer = createRenderer({
    createElement,
    patchProp,
    insert
});
function createApp(...arg) {
    return renderer.createApp(...arg);
}

exports.createApp = createApp;
exports.createRenderer = createRenderer;
exports.createTextVNode = createTextVNode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.provide = provide;
exports.renderSlots = renderSlots;
