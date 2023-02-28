
import { createApp, h } from '../../lib/my-vue.esm.js'
const App = {
    render() {
        return h(
            'div', // type
            {
                id:'box',
                class:['red','big']
            }, // props
            // children 可以为string 也可以为Array
            // 'Hellow ' + this.message // string
            [h('p',{class:'blue'},'I am'),h('span',{class:'gray'},' yifanwu')]
        );
    },

    setup() {
        return {
            message: 'world'
        }
    }
};

const appDom = document.querySelector('#app')
const app = createApp(App);
app.mount(appDom);