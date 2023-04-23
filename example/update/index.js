/*
 * @Author: wuyifan 1208097313@qq.com
 * @Date: 2023-04-20 00:26:32
 * @LastEditors: wuyifan 1208097313@qq.com
 * @LastEditTime: 2023-04-23 23:52:08
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
                ...this.props
            },
            [
                h('p',{},'count :'+this.count),
                h('button',{
                    onClick:this.onClick
                },'click'),
                h('button',{
                    onClick:this.click1
                },'修改 foo -> new foo'),
                h('button',{
                    onClick:this.click2
                },'修改 foo -> underfind'),
                h('button',{
                    onClick:this.click3
                },'删除 props 的 boo 属性')
            ]
        );
    },

    setup() {
        const count = ref(0);
        const onClick = ()=>{
            count.value++;
        }
        const props = ref({
            foo:'foo',
            boo:'boo',
        })

        const click1 = ()=>{
            props.value.foo = 'new-foo'
        }
        const click2 = ()=>{
            props.value.foo = undefined
        }
        const click3 = ()=>{
            props.value = { foo:'doo'}
        }
        return {
            count,
            props,
            click1,
            click2,
            click3,
            onClick
        }
    }
};

const appDom = document.querySelector('#app')
const app = createApp(App);
app.mount(appDom);