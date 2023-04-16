
import { createApp, h, provide, inject, getCurrentInstance } from '../../lib/my-vue.esm.js';


const Injecter = {
    render() {
        return h('span', {}, `this is Injecter foo-> ${this.foo} \n bar -> ${this.bar} \n poo -> ${this.poo} \n aoo -> ${this.aoo} \n boo -> ${this.boo}`)
    },

    setup() {
        const foo = inject('foo');
        const bar = inject('bar');
        const poo = inject('poo');
        // inject 支持默认值
        const aoo = inject('aoo', 'default Aoo');
        // inject 支持函数调用返回默认值
        const boo = inject('boo', () => 'default boo')
        return {
            foo,
            bar,
            poo,
            aoo,
            boo
        }
    }

};
const Provider = {
    render() {
        return h('span', {}, [h('p', {}, `this is Provider:${this.foo} `), h(Injecter)])
    },

    setup() {
        const foo = inject('foo')
        provide('foo', '||provider -> foo||');
        provide('bar', '||provider -> bar||');
        return {
            foo
        }
    }
}


const App = {
    render() {
        return h('div', {}, [h(Provider)])
    },

    setup() {
        //支持隔代传，像原型链一样
        provide('poo', 'app provide poo');
        // 优先寻找父级
        provide('foo', '||App -> foo||');
        return {}
    }
};



const appDom = document.querySelector('#app')
const app = createApp(App);
app.mount(appDom);