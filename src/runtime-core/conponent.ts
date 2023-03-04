import { PublicInstanceProxyHandles } from "./componentPublicInstance";

export function createComponentInstance(vnode) {
    //创建对象实例
    const component = {
        vnode,
        type: vnode.type,
        setupState:{}
    }

    return component

}

export function setupComponent(instance) {
    // 初始化
    // initProps
    // initSlots


    // 配置有状态的组件
    setupStatefulComponent(instance)


}

function setupStatefulComponent(instance: any) {

    const component = instance.type;

    // 代理this
    instance.proxy = new Proxy({'_':instance}, PublicInstanceProxyHandles);

    const { setup } = component; // type 为component

    // 可能没有setup
    if (setup) {
        const setupResult = setup();
        // 处理 setup 返回结果
        handleSetupResult(instance, setupResult)
    }
}
function handleSetupResult(instance, setupResult: any) {
    // result 可以是函数，也可以是对象

    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
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

