import { isObject } from "../shared/index";
import { mutableHandlers, readonlyHandlers, shallowReadonlyHandlers } from "./baseHandlers";

export const enum ReactiveFlags {
    IS_REACTIVE = "__v_isReactive",
    IS_READONLY = "__v_isReadonly"
}

function createReactiveObject(raw,baseHandler) {
    return new Proxy(raw,baseHandler)
}

export function reactive(raw) {
    return createReactiveObject(raw,mutableHandlers)
}

export function readonly(raw) {
    return createReactiveObject(raw,readonlyHandlers)
}

export function shallowReadonly(raw) {
    if(!isObject(raw)){
        console.warn(`target ${raw} is not Object`);
        return raw;
    }
    return createReactiveObject(raw,shallowReadonlyHandlers)
}

export function isReactive(object) {
    // 验证调用get 方法拿到get的isReadonly，如果不是返回underfind 转换为布尔值
    return !!object[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(object) {
    return !!object[ReactiveFlags.IS_READONLY]
}

export function isProxy(value) {
    return isReactive(value) || isReadonly(value);
}