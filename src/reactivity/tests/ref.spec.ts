import { effect } from "../effect";
import { ref } from "../ref";

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
});