const extend = Object.assign;
const isObject = value => value !== null && typeof value === 'object';
const hasChange = (newValue, value) => !Object.is(newValue, value);
const isOn = (key) => /^on[A-Z]/.test(key);
const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);
const capitalize = (key) => key.charAt(0).toUpperCase() + key.slice(1);
const toHadelKey = (key) => key ? 'on' + capitalize(key) : '';
const camelize = (key) => key.replace(/-(\w)/g, (_, c) => c ? c.toUpperCase() : '');
const EMPTY_OBJ = {};

const Fragment = Symbol('Fragment');
const Text = Symbol('Text');
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        key: props && props.key,
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

let activeEffect;
// 判断是否因该收集依赖 ，用于在stop() 后调用get，会继续收集依赖的问题
let shouldTrack;
class ReactiveEffect {
    constructor(_fn, scheduler) {
        this.scheduler = scheduler;
        // 存放放dep
        this.deps = [];
        // 标志位是否执行过stop，true：未执行过stop
        this.active = true;
        this._fn = _fn;
    }
    run() {
        if (!this.active) {
            return this._fn();
        }
        shouldTrack = true;
        activeEffect = this;
        const result = this._fn();
        shouldTrack = false;
        return result;
    }
    stop() {
        if (this.active) {
            this.active = false;
            this.deps.forEach((dep) => {
                dep.delete(this);
            });
            this.deps.length = 0;
            if (this.onStop) {
                this.onStop();
            }
        }
    }
}
const targetMap = new Map();
function track(target, key) {
    // target 对应原始对象, key 对应当前修改的字段
    // 一个target 对应一个 key ，一个key对应一个dep；
    /**
     *  例如 target 为 {age:10}, key 为 age ， effect(()=>user.age++);
     *
     * targetMap的第一项是 key为target ,value 为自己的depMap的map
     * depMap 的第一项是 key为 age ，value 为一个dep 的set
     * dep 是集合 里面是存放的effect
     *
     **/
    if (!isTracking()) {
        return;
    }
    let depMap = targetMap.get(target);
    if (!depMap) {
        depMap = new Map();
        targetMap.set(target, depMap);
    }
    let dep = depMap.get(key);
    if (!dep) {
        dep = new Set();
        depMap.set(key, dep);
    }
    trackEffect(dep);
}
function trackEffect(dep) {
    // 如果收集过就停止收集
    if (dep.has(activeEffect))
        return;
    // 现在执行的effect 为当前的activeEffect(当前依赖项)
    dep.add(activeEffect);
    // 反向收集dep，使effect 有dep
    activeEffect.deps.push(dep);
}
function isTracking() {
    // 当收集时，没有effect的时候，需要返回
    // if (!activeEffect) return;
    // 当执行过stop 后，再次调用get时依赖不应该被收集
    // if (!shouldTrack) return;
    // 等同于
    return shouldTrack && activeEffect !== undefined;
}
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
function effect(fn, options = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler);
    extend(_effect, options);
    _effect.run();
    const runner = _effect.run.bind(_effect);
    // 反向收集，使runner拥有effect属性
    runner.effect = _effect;
    return runner;
}
function stop(runner) {
    // 实现 stop 只需要删除对应dep里的efffect函数
    runner.effect.stop();
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
        if (!isReadonly) {
            // 依赖收集
            track(target, key);
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
function isReactive(object) {
    // 验证调用get 方法拿到get的isReadonly，如果不是返回underfind 转换为布尔值
    return !!object["__v_isReactive" /* ReactiveFlags.IS_REACTIVE */];
}
function isReadonly(object) {
    return !!object["__v_isReadonly" /* ReactiveFlags.IS_READONLY */];
}
function isProxy(value) {
    return isReactive(value) || isReadonly(value);
}

class RefImpl {
    constructor(value) {
        this.__v_isRef = true;
        // 存储原始对象
        this._rawValue = value;
        // 判断value是不是Object，如果是需要转位 reactive
        this._value = isObject(value) ? reactive(value) : value;
        this.dep = new Set();
    }
    get value() {
        // 当activeEffect 不等于 underfind 时开始收集
        if (isTracking()) {
            // 收集依赖，只有一个value属性
            trackEffect(this.dep);
        }
        return this._value;
    }
    set value(newValue) {
        // 这里用原对象去对比，而不是转化后的reactive对象
        // 如果值相同 只会触发一次
        if (hasChange(newValue, this._rawValue)) {
            // 更新原始对象
            this._rawValue = newValue;
            //  先修改， 在触发
            this._value = isObject(newValue) ? reactive(newValue) : newValue;
            triggerEffect(this.dep);
        }
    }
}
function ref(value) {
    return new RefImpl(value);
}
function isRef(ref) {
    return !!ref.__v_isRef;
}
function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}
function proxyRef(objectWithRef) {
    return new Proxy(objectWithRef, {
        // 判断是不是ref对象，如果是返回.value,不是返回原值
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        // 判断是不是erf对象，如果是修改.value,不是则添加value属性
        set(target, key, value) {
            // 当原始对象是ref,新值不是ref是直接赋值
            if (isRef(target[key]) && !isRef(value)) {
                return target[key].value = value;
            }
            else {
                // 其余的情况都是直接替换
                return Reflect.set(target, key, value);
            }
        }
    });
}

class ComputedRefImpl {
    constructor(getter) {
        this._dirty = true;
        this._getter = getter;
        this._effect = new ReactiveEffect(getter, () => {
            if (!this._dirty) {
                this._dirty = true;
            }
        });
    }
    get value() {
        if (this._dirty) {
            this._dirty = false;
            this._value = this._effect.run();
        }
        return this._value;
    }
}
function computed(getter) {
    return new ComputedRefImpl(getter);
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

/*
 * @Author: wuyifan 1208097313@qq.com
 * @Date: 2023-02-24 00:10:49
 * @LastEditors: wuyifan 1208097313@qq.com
 * @LastEditTime: 2023-04-20 01:11:40
 * @FilePath: /my-vue/src/runtime-core/component.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
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
        isMounted: false,
        subTree: {},
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
        instance.setupState = proxyRef(setupResult);
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
    const { createElement: hostCreateElement, insert: hostInsert, patchProp: hostPatchProp, remove: hostRemove, setElementText: hostSetElementText } = options;
    function render(vnode, container) {
        //调用patch
        patch(null, vnode, container, null, null);
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
                processFragment(n1, n2, container, parentComponent, anchor);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (shapeFlag & 1 /* ShapeFlag.ELEMENT */) {
                    processElement(n1, n2, container, parentComponent, anchor);
                }
                else if (shapeFlag & 2 /* ShapeFlag.STATEFUL_COMPONENT */) {
                    processComponent(n1, n2, container, parentComponent, anchor);
                }
                break;
        }
    }
    function processFragment(n1, n2, container, parentComponent, anchor) {
        if (!n1) {
            mountChildren(n2.children, container, parentComponent, anchor);
        }
    }
    function processText(n1, n2, container) {
        const textNode = n2.el = document.createTextNode(n2.children);
        container.append(textNode);
    }
    function processElement(n1, n2, container, parentComponent, anchor) {
        if (!n1) {
            // n1 为空是第一次初始化
            mountElement(n2, container, parentComponent, anchor);
        }
        else {
            patchElement(n1, n2, container, parentComponent, anchor);
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
        patchChildren(n1, n2, el, parentComponent, anchor);
    }
    function patchChildren(n1, n2, container, parentComponent, anchor) {
        const oldShapeFlag = n1.shapeFlag;
        const newShapeFlag = n2.shapeFlag;
        const oldChildren = n1.children;
        const newChildren = n2.children;
        if (newShapeFlag & 4 /* ShapeFlag.TEXT_CHILDREN */) {
            // 老的是数组，新的是text
            if (oldShapeFlag & 8 /* ShapeFlag.ARRAY_CHILDREN */) {
                // 1.清除老的
                unmountChildren(oldChildren);
                // 2.设置新的
                hostSetElementText(container, newChildren);
            }
            else {
                // 老的是Text 新的也是Text
                if (oldChildren !== newChildren) {
                    hostSetElementText(container, newChildren);
                }
            }
        }
        else {
            // 老的是Text 新的是数组
            if (oldShapeFlag & 4 /* ShapeFlag.TEXT_CHILDREN */) {
                // 1.清除老的Text
                hostSetElementText(container, '');
                // 2.设置新的
                mountChildren(newChildren, container, parentComponent, anchor);
            }
            else {
                // 老的是Array新的还是Array
                patchKeyedChildren(oldChildren, newChildren, container, parentComponent, anchor);
            }
        }
    }
    function patchKeyedChildren(oldChildren, newChildren, container, parentComponent, parrentAnchor) {
        console.log('newChildren ->', newChildren);
        console.log('oldChildren -> ', oldChildren);
        let i = 0;
        const newChildrenLength = newChildren.length;
        let oldIndex = oldChildren.length - 1;
        let newIndex = newChildrenLength - 1;
        function isSameVNodeType(child1, child2) {
            // 判断依据，type 和 key
            return child1.type === child2.type && child1.key === child2.key;
        }
        // 左侧对比
        while (i <= oldIndex && i <= newIndex) {
            const oldNodeChild = oldChildren[i];
            const newNodeChild = newChildren[i];
            if (isSameVNodeType(oldNodeChild, newNodeChild)) {
                patch(oldNodeChild, newNodeChild, container, parentComponent, parrentAnchor);
            }
            else {
                break;
            }
            i++;
        }
        // 右侧对比
        while (i <= oldIndex && i <= newIndex) {
            const oldNodeChild = oldChildren[oldIndex];
            const newNodeChild = newChildren[newIndex];
            if (isSameVNodeType(oldNodeChild, newNodeChild)) {
                patch(oldNodeChild, newNodeChild, container, parentComponent, parrentAnchor);
            }
            else {
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
                    i++;
                }
            }
        }
        else if (i > newIndex) {
            // 老的比新的长，需要删除
            while (i <= oldIndex) {
                hostRemove(oldChildren[i].el);
                i++;
            }
        }
    }
    function mountChildren(children, container, parentComponent, anchor) {
        children.forEach(v => patch(null, v, container, parentComponent, anchor));
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
                    hostPatchProp(el, key, oldProp, newProp);
                }
            }
            if (oldProps !== EMPTY_OBJ) {
                for (const key in oldProps) {
                    if (!(key in newProps)) {
                        hostPatchProp(el, key, oldProps[key], null);
                    }
                }
            }
        }
    }
    function mountElement(vnode, container, parentComponent, anchor) {
        const { type, children, props, shapeFlag } = vnode;
        const el = vnode.el = hostCreateElement(type);
        if (shapeFlag & 4 /* ShapeFlag.TEXT_CHILDREN */) {
            el.textContent = children;
        }
        else if (shapeFlag & 8 /* ShapeFlag.ARRAY_CHILDREN */) {
            mountChildren(children, el, parentComponent, anchor);
        }
        for (const key in props) {
            hostPatchProp(el, key, null, props[key]);
        }
        hostInsert(el, container, anchor);
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
        setupRenderEffect(instance, initialVnode, container, anchor);
    }
    function setupRenderEffect(instance, initialVnode, container, anchor) {
        effect(() => {
            if (!instance.isMounted) {
                // init
                console.log('init');
                const { proxy } = instance;
                // 生成虚拟节点树
                // 绑定 this
                const subTree = (instance.subTree = instance.render.call(proxy));
                // 现在已经将组件转化为vnode,subTree为vnode 
                // 变成vnode后由patch进行处理
                // vnode -> element -> mouuntElement
                patch(null, subTree, container, instance, anchor);
                initialVnode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                // update
                console.log('update');
                // 获取之前的subtree
                const { proxy, subTree: prevSubTree } = instance;
                const subTree = instance.render.call(proxy);
                // 将最新的根节点更新
                patch(prevSubTree, subTree, container, instance, anchor);
                instance.subTree = subTree;
            }
        });
    }
    return {
        createApp: createAppAPI(render)
    };
}

/*
 * @Author: wuyifan 1208097313@qq.com
 * @Date: 2023-04-17 23:44:17
 * @LastEditors: wuyifan 1208097313@qq.com
 * @LastEditTime: 2023-05-03 01:47:21
 * @FilePath: /my-vue/src/runtime-dom/index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
function createElement(type) {
    return document.createElement(type);
}
function patchProp(el, key, prevVal, nextVal) {
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, nextVal);
    }
    else {
        if (key === 'class') {
            const value = nextVal.join(' ');
            el.setAttribute(key, value);
        }
        else {
            if (nextVal === null || nextVal === undefined) {
                el.removeAttribute(key, nextVal);
            }
            else {
                el.setAttribute(key, nextVal);
            }
        }
    }
}
function insert(child, parent, anchor) {
    // console.log('parent->',parent);
    // console.log('child->',child);
    // console.log('a->',anchor);
    parent.insertBefore(child, anchor || null);
}
function remove(child) {
    const parent = child.parentNode;
    if (parent) {
        parent.removeChild(child);
    }
}
function setElementText(el, text) {
    el.textContent = text;
}
const renderer = createRenderer({
    createElement,
    patchProp,
    insert,
    remove,
    setElementText
});
function createApp(...arg) {
    return renderer.createApp(...arg);
}

export { ReactiveEffect, computed, createApp, createRenderer, createTextVNode, effect, getCurrentInstance, h, inject, isProxy, isReactive, isReadonly, isRef, isTracking, provide, proxyRef, reactive, readonly, ref, renderSlots, shallowReadonly, stop, track, trackEffect, trigger, triggerEffect, unRef };
