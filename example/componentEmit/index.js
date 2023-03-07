
import { createApp, h } from '../../lib/my-vue.esm.js';
const App = {
    render() {
        return h(
            'div', // type
            {
                id: 'box',
                class: ['red', 'big']
            },
            [h('span', {}, 'this is Foo ->'), h(Foo, {
                onHandel(a,b){
                    console.log('emit is happen');
                    console.log(a+b);
                },
                onHandelFoo(a,b){
                    console.log('emit  onHandelFoo is happen',a+b);
                }
            })]
        );
    },

    setup() {
        return {}
    }
};

const Foo = {
    render() {
        const button = h('button',{onClick:this.handelClick},'this is a button')
        return h('div', {},[button])
    },

    setup(props,{emit}) {
        const handelClick= ()=>{
            console.log('子元素触发 handelClick');
            emit('handel',1,2);
            emit('handel-foo',1,2)

        }
        return {handelClick}
    }
}

const appDom = document.querySelector('#app')
const app = createApp(App);
app.mount(appDom);