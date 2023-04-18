/*
 * @Author: wuyifan 1208097313@qq.com
 * @Date: 2023-04-18 23:25:05
 * @LastEditors: wuyifan 1208097313@qq.com
 * @LastEditTime: 2023-04-19 00:11:27
 * @FilePath: /my-vue/example/customRender/index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */


import { createRenderer, h } from '../../lib/my-vue.esm.js';

const { Application, Graphics } = PIXI;

const game = new Application({
    with: 500,
    height: 500
})

document.body.append(game.view);

const renderer = createRenderer({
    createElement(type) {
        if (type === 'rect') {
            const rect = new Graphics();
            rect.beginFill(0xff0000);
            rect.drawRect(0, 0, 100, 100);
            rect.endFill();
            return rect
        }

    },
    patchProp(el, key, val) {
        el[key] = val

    },
    insert(parent, el) {
        parent.addChild(el)
    }
})

const App = {
    render() {
        return h('rect', { x: this.x, y: this.y })
    },

    setup() {
        return {
            x: 100,
            y: 100
        }
    }
};

renderer.createApp(App).mount(game.stage)

