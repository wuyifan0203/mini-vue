import { isReactive, reactive } from "../reactive";

describe('reactive', () => {
    it('happy path', () => {
        const origin = { foo:1};
        const obvsered = reactive(origin);

        expect(origin).not.toBe(obvsered);
        expect(obvsered.foo).toBe(1);

        expect(isReactive(obvsered)).toBe(true);
        expect(isReactive(origin)).toBe(false);
    });

    test('nested reactive', () => {
        const origin = {
            nested:{
                foo:1
            },
            array:[{boo:2}]
        };
        const obvsered = reactive(origin);
        expect(isReactive(obvsered.nested)).toBe(true);
        expect(isReactive(obvsered.array)).toBe(true);
        expect(isReactive(obvsered.array[0])).toBe(true);
        
    });
});