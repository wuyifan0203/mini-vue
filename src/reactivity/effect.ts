class ReactiveEffect{
    private _fn:any

    constructor(_fn){
        this._fn = _fn
    }

    run(){
        activeEffect = this
         return this._fn();
    }
}

const targetMap = new Map();

export function track(target:any,key:any) {
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
    let depMap = targetMap.get(target);
    if(!depMap){
        depMap = new Map();
        targetMap.set(target,depMap)
    }

    let dep = depMap.get(key);
    if(!dep){
        dep = new Set();
        depMap.set(key,dep)
    }
    // 现在执行的effect 为当前的activeEffect(当前依赖项)
    dep.add(activeEffect)
}

export function trigger(target,key) {
    let depMap = targetMap.get(target);
    let dep = depMap.get(key);

    for (const effect of dep) {
        effect.run()
    }
    
}
let activeEffect;
export function effect(fn) {
    const _effect = new ReactiveEffect(fn);

    _effect.run()

    return _effect.run.bind(_effect)
    
}