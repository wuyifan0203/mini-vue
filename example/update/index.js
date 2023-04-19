/*
 * @Author: wuyifan 1208097313@qq.com
 * @Date: 2023-04-20 00:26:32
 * @LastEditors: wuyifan 1208097313@qq.com
 * @LastEditTime: 2023-04-20 00:37:57
 * @FilePath: /my-vue/example/update/index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
 
import { createApp, h ,ref} from '../../lib/my-vue.esm.js';
const App = {
    name:'App',
    render() {
        return h(
            'div',
            {
                id:'root',
            }, // props
            [
                h('p',{},'count :'+this.count),
                h('button',{
                    onClick:this.onClick
                },'click')
            ]
        );
    },

    setup() {
        const count = ref(0);
        const onClick = ()=>{
            count.value++;
        }
        return {
            count,
            onClick
        }
    }
};

const appDom = document.querySelector('#app')
const app = createApp(App);
app.mount(appDom);