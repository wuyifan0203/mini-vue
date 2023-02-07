import { readonly } from "../reactive";

describe('readonly', () => {
    it('happy path', () => {
        //不能设置值

        const user = {
            age: 24,
            work: {
                coder: 'front'
            }
        }

        const wrapped = readonly(user);
        expect(wrapped).not.toBe(user);

        expect(wrapped.age).toBe(24);

    });

    it('warn when call set', () => {

        console.warn = jest.fn();
        //调用set 出现警告
        const user = readonly({ age: 24 })
        user.age = 11;
        expect(console.warn).toBeCalled();
    });

});