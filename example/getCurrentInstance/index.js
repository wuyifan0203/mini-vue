
import { createApp, h, getCurrentInstance } from '../../lib/my-vue.esm.js';

const Foo = {
    render() {
        const foo = h('p', {}, 'foo')
        return h('span', {}, [foo])
    },

    setup() {
        const instance = getCurrentInstance();
        console.log('Foo instance',instance);
        return {}
    }
}
const App = {
    render() {
        const app = h('div', {}, 'App');
        return h('div', {}, [app,h(Foo)])
    },

    setup() {
        const instance = getCurrentInstance();
        console.log('APP instance',instance);
        return {}
    }
};



const appDom = document.querySelector('#app')
const app = createApp(App);
app.mount(appDom);