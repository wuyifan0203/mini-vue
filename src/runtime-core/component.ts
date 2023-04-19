/*
 * @Author: wuyifan 1208097313@qq.com
 * @Date: 2023-02-24 00:10:49
 * @LastEditors: wuyifan 1208097313@qq.com
 * @LastEditTime: 2023-04-20 01:11:40
 * @FilePath: /my-vue/src/runtime-core/component.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { proxyRef } from "../reactivity";
import { shallowReadonly } from "../reactivity/reactive";
import { initProps } from "./componentProps";
import { PublicInstanceProxyHandles } from "./componentPublicInstance";
import { initSlots } from "./compontSlots";
import { emit } from "./compontentEmit";

export function createComponentInstance(vnode, parent) {
    //创建对象实例
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        provides: parent?.provides ? parent.provides : {},
        parent,
        isMounted:false,
        subTree:{},
        emit: () => { }
    }

    component.emit = emit.bind(null, component) as any;

    return component

}

export function setupComponent(instance) {
    // 初始化
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children)

    // 配置有状态的组件
    setupStatefulComponent(instance)


}

function setupStatefulComponent(instance: any) {

    const component = instance.type;

    // 代理this
    instance.proxy = new Proxy({ '_': instance }, PublicInstanceProxyHandles);

    const { setup } = component; // type 为component

    // 可能没有setup
    if (setup) {
        currentInstance = instance
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        });
        currentInstance = null;
        // 处理 setup 返回结果
        handleSetupResult(instance, setupResult)
    }
}
function handleSetupResult(instance, setupResult: any) {
    // result 可以是函数，也可以是对象

    if (typeof setupResult === 'object') {
        instance.setupState = proxyRef(setupResult);
    } else if (typeof setupResult === 'function') {

    }

    finishComponentSetup(instance)
}

function finishComponentSetup(instance: any) {

    const component = instance.type;

    // if(component.render){
    instance.render = component.render
    // }
}

let currentInstance = null;

export function getCurrentInstance() {
    return currentInstance;
}

