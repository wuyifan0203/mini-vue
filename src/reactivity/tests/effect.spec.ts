import { effect } from "../effect";
import { reactive } from "../reactive";
describe('effect', () => {
    it('happy path', () => {

        // 执行effect函数，会调用传的fn
        // reactive对象 . 会调用get方法
        // 赋值时会调用set 方法
        const user = reactive({
            age:10
        });

        let nextAge;
        const fn = ()=>{
            nextAge = user.age +1
        }
        effect(fn)

        expect(nextAge).toBe(11)
        // update

        user.age ++;
        expect(nextAge).toBe(12);
        expect(user.age).toBe(11)
    });

    it('should return runner', () => {
        //执行effect 会返回一个函数
        // 这个返回的函数叫runner
        //执行runner会调用effect的fn函数，返回fn执行后的值
        let foo = 1;
        const runner = effect(()=>{
            foo++;
            return 'foo'
        })

        expect(foo).toBe(2);
        const res = runner();
        expect(foo).toBe(3);
        expect(res).toBe('foo');

    });
});