import { extend } from "../shared";

let activeEffect;
// 判断是否因该收集依赖 ，用于在stop() 后调用get，会继续收集依赖的问题
let shouldTrack;
export class ReactiveEffect {
    // 存放放dep
    deps = [];
    // 标志位是否执行过stop，true：未执行过stop
    active = true;
    // 内部的fn
    private _fn: any
    // 是否传入过onStop ，在调用stop时执行
    onStop?: () => void

    constructor(_fn, public scheduler?) {
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
            this.active = false
            this.deps.forEach((dep: any) => {
                dep.delete(this)
            });
            this.deps.length = 0;
            if (this.onStop) {
                this.onStop();
            }
        }
    }
}

const targetMap = new Map();

export function track(target: any, key: any) {
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
    if(!isTracking()){
        return
    }

    let depMap = targetMap.get(target);
    if (!depMap) {
        depMap = new Map();
        targetMap.set(target, depMap)
    }

    let dep = depMap.get(key);
    if (!dep) {
        dep = new Set();
        depMap.set(key, dep)
    }
    trackEffect(dep)
}

export function trackEffect(dep) {
        // 如果收集过就停止收集
        if(dep.has(activeEffect)) return;
        // 现在执行的effect 为当前的activeEffect(当前依赖项)
        dep.add(activeEffect);
        // 反向收集dep，使effect 有dep
        activeEffect.deps.push(dep);
}

export function isTracking() {

        // 当收集时，没有effect的时候，需要返回
        // if (!activeEffect) return;
        // 当执行过stop 后，再次调用get时依赖不应该被收集
        // if (!shouldTrack) return;

        // 等同于
    return shouldTrack && activeEffect !== undefined;
}

export function trigger(target, key) {
    let depMap = targetMap.get(target);
    let dep = depMap.get(key);

    triggerEffect(dep);
}

export function triggerEffect(dep){
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();

        } else {
            effect.run()
        }
    }
}

export function effect(fn, options: any = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler);
    extend(_effect, options);

    _effect.run()

    const runner: any = _effect.run.bind(_effect);
    // 反向收集，使runner拥有effect属性
    runner.effect = _effect;

    return runner;

}

export function stop(runner) {
    // 实现 stop 只需要删除对应dep里的efffect函数
    runner.effect.stop();
}