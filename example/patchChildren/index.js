/*
 * @Author: wuyifan 1208097313@qq.com
 * @Date: 2023-04-24 23:31:29
 * @LastEditors: wuyifan 1208097313@qq.com
 * @LastEditTime: 2023-04-25 00:51:15
 * @FilePath: /my-vue/example/patchChildren/index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { createApp, h, ref } from '../../lib/my-vue.esm.js';



const ArrayToText = {
    render() {
        const self = this;
        const nextChild = 'This is text child';
        const prevChild = [h('span', {}, 'A'), h('span', {}, 'B')];
        return h('div', {},
            self.isChange ? nextChild : prevChild
        )
    },

    setup() {
        const isChange = ref(false);
        window.ArrayToTextIsChange = isChange;
        return {
            isChange
        }
    }
};

const TextToText = {
    render() {
        const self = this;
        const nextChild = 'new child';
        const prevChild = 'old child';
        return h('div', {},
            self.isChange ? nextChild : prevChild
        )
    },

    setup() {
        const isChange = ref(false);
        window.TextToTextIsChange = isChange;
        return {
            isChange
        }
    }
}

const TextToArray = {
    render() {
        const self = this;
        const prevChild = 'This is text child';
        const nextChild = [h('span', {}, 'C'), h('span', {}, 'D')];
        return h('div', {},
            self.isChange ? nextChild : prevChild
        )
    },

    setup() {
        const isChange = ref(false);
        window.TextToArrayIsChange = isChange;
        return {
            isChange
        }
    }
}

const App = {
    render() {
        return h('div', { tid: 1 }, [
            h('p', {}, 'main'),
            // 老的是array 新的是text
            h(ArrayToText),
            // 老的是Text 新的也是Text
            h(TextToText),
            // 老的是Text， 新的是Array
            h(TextToArray)
        ]);
    },
    setup() { }
};

const appDom = document.querySelector('#app')
const app = createApp(App);
app.mount(appDom);