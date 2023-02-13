import { effect,stop } from "../effect";
import { reactive } from "../reactive";
describe('effect', () => {
    it('happy path', () => {

        // 执行effect函数，会调用传的fn
        // reactive对象 . 会调用get方法
        // 赋值时会调用set 方法,set会执行effect的fn
        const user = reactive({
            age: 10
        });

        let nextAge;
        const fn = () => {
            nextAge = user.age + 1
        }
        // 执行effect 会调用fn
        effect(fn)
        expect(nextAge).toBe(11)
        // update

        user.age++;
        expect(nextAge).toBe(12);
        expect(user.age).toBe(11)
    });

    it('should return runner', () => {
        //执行effect 会返回一个函数
        // 这个返回的函数叫runner
        //执行runner会调用effect的fn函数，返回fn执行后的值
        let foo = 1;
        const runner = effect(() => {
            foo++;
            return 'foo'
        })

        expect(foo).toBe(2);
        const res = runner();
        expect(foo).toBe(3);
        expect(res).toBe('foo');

    });

    it('scheduler', () => {
        // 1. 通过 effect 的第二个参数，给 scheduler 传一个 fn作为参数
        // 2. effect 第一次执行的时候 还会执行fn
        // 3.当响应式对象 触发set 并更新时不会执行fn，而是执行 scheduler
        // 4.当执行runner 会再次执行fn

        let dummy;
        let run;
        const scheduler = jest.fn(() => {
            run = runner;
        });
        const obj = reactive({ foo: 1 });

        const runner = effect(() => {
            dummy = obj.foo;
        }, { scheduler });

        expect(scheduler).not.toHaveBeenCalled();
        expect(dummy).toBe(1);
        obj.foo++;
        expect(scheduler).toHaveBeenCalledTimes(1);
        expect(dummy).toBe(1);
        run()
        expect(dummy).toBe(2);
    });

    it('stop', () => {
        let dummy;
        const obj = reactive({ foo: 1 });
        const runner = effect(() => {
            dummy = obj.foo;
        });

        obj.foo =2;
        // 赋值操作，触发effect 的fn
        expect(dummy).toBe(2);
        stop(runner);
        // obj.foo=3;
        // 先 get 后 set
        obj.foo++;
        
        // stop 后，不会调用 efffect 的fn
        expect(dummy).toBe(2);


        runner();
        // 执行runner 会调用effect的fn
        expect(dummy).toBe(3);

    });

    it('should call onStop when use stop', () => {
        const user = reactive({
            age:23
        });

        const onStop = jest.fn();

        let newAge;

        const runner = effect(()=>{
            newAge = user.age;
        },
        {
            onStop
        })
        
        user.age = 24;
        expect(newAge).toBe(24);

        stop(runner);
        expect(onStop).toBeCalledTimes(1);

    });
});