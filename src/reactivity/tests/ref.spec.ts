import { effect } from "../effect";
import { isRef, ref, unRef,proxyRef } from "../ref";

describe('ref', () => {
    it('happy path', () => {
        // ref 对象拥有value 属性
        const a = ref(1);
        expect(a.value).toBe(1);
    });

    it('should be reactive', () => {
        // 通过effec做依赖收集
        // 触发set操作会再次执行effect
        const a = ref(1);
        let dummy;
        let calls = 0;
        effect(()=>{
            calls++;
            dummy = a.value;
        });
        expect(calls).toBe(1);
        expect(dummy).toBe(1);
        a.value = 2;
        expect(calls).toBe(2);
        expect(dummy).toBe(2);

        a.value = 2;
        // 相同set赋值只会触发一次
        expect(calls).toBe(2);
        expect(dummy).toBe(2);
    });

    it('should make nested properties reactive', () => {
        // 将ref内的对象转化为reactive
        const a = ref({
            count:1
        });
        let dummy;
        effect(()=>{
            dummy = a.value.count;
        })

        expect(dummy).toBe(1);
        a.value.count++;
        expect(dummy).toBe(2);
    });

    it('isRef ', () => {
        // 判断是否为ref对象
        const a = ref(1);
        expect(isRef(a)).toBe(true);
        expect(isRef(1)).toBe(false);
    });

    it('unRef', () => {
        // 返回ref的value
        const a = ref(1);
        expect(unRef(a)).toBe(1);
        expect(unRef(1)).toBe(1);
    });


    // 用于template中
    it('proxyRef', () => {

        const user = {
            age:ref(10),
            name:"Lin"
        }

        const proxyUser = proxyRef(user);
        expect(user.age.value).toBe(10);
        expect(proxyUser.age).toBe(10);
        expect(proxyUser.name).toBe('Lin');

        proxyUser.age++;
        expect(user.age.value).toBe(11);
        expect(proxyUser.age).toBe(11);

        proxyUser.age = ref(15);
        expect(user.age.value).toBe(15);
        expect(proxyUser.age).toBe(15);
    });
});