import { computed } from "../computed";
import { reactive } from "../reactive";

describe('Computed', () => {
    it('happy path', () => {
        const user = reactive({
            age: 1
        })

        const age = computed(() => {
            return user.age
        })

        expect(age.value).toBe(1);
    });

    it('should computed lazily', () => {
        const value = reactive({
            a: 1
        })

        const getter = jest.fn(() => {
            return value.a
        })

        const cValue = computed(getter);
        // 如果不调用cvalue.value 则getter不会被执行
        expect(getter).not.toHaveBeenCalled();
        expect(cValue.value).toBe(1)
        expect(getter).toHaveBeenCalledTimes(1);

        // 停止调用
        cValue.value;
        expect(getter).toHaveBeenCalledTimes(1);

        value.a = 2;
        // 原始值改变后不会被调用
        expect(getter).toHaveBeenCalledTimes(1);


        // 在原始值改变后，出发新的get操作，会被调用
        expect(cValue.value).toBe(2);
        expect(getter).toHaveBeenCalledTimes(2);


        // 缓存
        cValue.value
        expect(getter).toHaveBeenCalledTimes(2);


    });
});