
import { createApp, h } from '../../lib/my-vue.esm.js';
window.self = null;
const App = {
    render() {
        window.self = this;
        return h(
            'div', // type
            {
                id:'box',
                class:['red','big'],
                onClick(){
                    console.log('click');
                },
                onMousedown(){
                    console.log('mouse down');
                }
            }, // props
            'Hellow ' + this.message // string
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