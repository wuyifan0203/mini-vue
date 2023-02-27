
import { createApp, h } from '../../lib/my-vue.esm.js'
const App = {
    render() {
        return h('div', 'Hellow ' + this.message);
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