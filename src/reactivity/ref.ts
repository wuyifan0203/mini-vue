import { hasChange, isObject } from "../shared";
import { isTracking, trackEffect, triggerEffect } from "./effect";
import { reactive } from "./reactive";


class RefImpl {
    private _value: any;
    public dep;
    private _rawValue: any;
    constructor(value) {
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
        };

    }
}
export function ref(value) {
    return new RefImpl(value);
}