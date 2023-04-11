
import { createApp, h,renderSlots } from '../../lib/my-vue.esm.js';

const Foo = {
    render() {
        const foo = h('div',{},'foo')
        console.log(this.$slots);
        const age = 24;
        return h('div', {},[renderSlots(this.$slots,'header',{age}),foo,renderSlots(this.$slots,'footer')])
    },

    setup() {
        return {}
    }
}
const App = {
    render() {

        const app = h('div',{},'App');
        // 支持两种slots格式，第一种是一个vnode，第二种是一个对象
        // const foo2 = h(Foo,{},h('p',{},'vnode type'));
        const foo1 = h(Foo,{},{
            header:({age})=>h('p',{},'header'+ age),
            footer:()=>h('span',{},'footer')
        })
        return h('div',{},[app,foo1])
    },

    setup() {
        return {}
    }
};



const appDom = document.querySelector('#app')
const app = createApp(App);
app.mount(appDom);