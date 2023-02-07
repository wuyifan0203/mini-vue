import { track, trigger } from "./effect";

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);

 //只要对象 . 会调用get方法
function createGetter(isReadonly = false) {
    return function get(target, key) {
        // res 为对象的实际指 -> target[key]
        const res = Reflect.get(target, key);
        if (!isReadonly) {
            // 依赖收集
            track(target, key)

        }
        return res;
    }
}

// 对象做 = 赋值操做，就会调用set方法
function createSetter() {
    return function set(target, key, value) {
        // res 为 boolean
        const res = Reflect.set(target, key, value);
        // 触发依赖
        trigger(target, key)
        return res
    }
}

export const mutableHandlers = {
    get,
    set
}

export const readonlyHandlers = {
    get:readonlyGet,
    set(target, key, value) {
        console.warn(`key ${key} cant't be set , because target is readonly object.`,target);
        return true;
    }

}