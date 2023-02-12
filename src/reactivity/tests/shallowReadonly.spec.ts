import { isReadonly, shallowReadonly } from "../reactive";

describe('shallowReadonly', () => {
    it('should not make non-reactive properties reactive', () => {
        const props = shallowReadonly({a:{b:1}});
        expect(isReadonly(props)).toBe(true);
        expect(isReadonly(props.a)).toBe(false);
        
    });

    it('warn when call set', () => {

        console.warn = jest.fn();
        //调用set 出现警告
        const user = shallowReadonly({ age: 24 })
        user.age = 11;
        expect(console.warn).toBeCalled();
    });
    
});