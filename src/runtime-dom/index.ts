/*
 * @Author: wuyifan 1208097313@qq.com
 * @Date: 2023-04-17 23:44:17
 * @LastEditors: wuyifan 1208097313@qq.com
 * @LastEditTime: 2023-04-19 00:09:39
 * @FilePath: /my-vue/src/runtime-dom/index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

import { createRenderer } from '../runtime-core'
import { isOn } from '../shared';
function createElement(type) {
    return document.createElement(type)
}

function patchProp(el, key, val) {
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, val);
    } else {
        if (key === 'class') {
            const value = val.join(' ')
            el.setAttribute(key, value);
        } else {
            el.setAttribute(key, val)
        }
    }
}

function insert(parent, el) {
    parent.append(el)
}


const renderer: any = createRenderer({
    createElement,
    patchProp,
    insert
})

export function createApp(...arg) {
    return renderer.createApp(...arg)
}

export * from '../runtime-core'