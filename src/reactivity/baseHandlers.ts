import { extend, isObject } from "../shared";
import { track, trigger } from "./effect";
import { reactive, ReactiveFlags, readonly } from "./reactive";

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true,true);

//只要对象 . 会调用get方法
function createGetter(isReadonly = false,isShallowReadonly = false) {
    return function get(target, key) {
        if (key === ReactiveFlags.IS_REACTIVE) {
            return !isReadonly
        } else if (key === ReactiveFlags.IS_READONLY) {
            return isReadonly
        }

        // res 为对象的实际指 -> target[key]
        const res = Reflect.get(target, key);

        if(isShallowReadonly){
            return res;
        }

        // res类型为object则转化为reactive
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }

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
};

export const readonlyHandlers = {
    get: readonlyGet,
    set(target, key, value) {
        console.warn(`key ${key} cant't be set , because target is readonly object.`, target);
        return true;
    }
};

export const shallowReadonlyHandlers = extend({},readonlyHandlers,{
    get:shallowReadonlyGet
});