import { track, trigger } from "./effect";

export function reactive(raw) {
    return new Proxy(raw,{
        //只要reactive对象 . 会调用get方法
        get(target,key){
            // res 为对象的实际指 -> target[key]
            const res = Reflect.get(target,key);

            // 依赖收集
            track(target,key)
            return res;
        },
        // 只要对reactive 对象做 = 赋值操做，就会调用set方法
        set(target,key,value){
            // res 为 boolean
            const res = Reflect.set(target,key,value);
            // 触发依赖
            trigger(target,key)

            return res
        }
    })
    
}