import { mutableHandlers, readonlyHandlers } from "./baseHandlers";

function createReactiveObject(raw,baseHandler) {
    return new Proxy(raw,baseHandler)
}

export function reactive(raw) {
    return createReactiveObject(raw,mutableHandlers)
}

export function readonly(raw) {
    return createReactiveObject(raw,readonlyHandlers)
}