
import { createApp, h } from '../../lib/my-vue.esm.js';
const App = {
    render() {
        return h(
            'div', // type
            {
                id: 'box',
                class: ['red', 'big']
            },
            [h('span', {}, 'this is Foo ->'), h(Foo, { count: 1 })]
        );
    },

    setup() {
        return {}
    }
};

const Foo = {
    render() {
        return h('div', {
            class: ['blue']
        }, 'I am Foo -> count ' + this.count)
    },

    setup(props) {
        console.log(props);
        // props 是 shallowReadonly 对象
        props.count++;
        return {}
    }
}

const appDom = document.querySelector('#app')
const app = createApp(App);
app.mount(appDom);