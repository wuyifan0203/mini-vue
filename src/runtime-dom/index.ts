/*
 * @Author: wuyifan 1208097313@qq.com
 * @Date: 2023-04-17 23:44:17
 * @LastEditors: wuyifan 1208097313@qq.com
 * @LastEditTime: 2023-05-03 01:47:21
 * @FilePath: /my-vue/src/runtime-dom/index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

import { createRenderer } from '../runtime-core'
import { isOn } from '../shared';
function createElement(type) {
    return document.createElement(type)
}

function patchProp(el, key, prevVal, nextVal) {
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, nextVal);
    } else {
        if (key === 'class') {
            const value = nextVal.join(' ')
            el.setAttribute(key, value);
        } else {
            if (nextVal === null || nextVal === undefined) {
                el.removeAttribute(key, nextVal)
            } else {
                el.setAttribute(key, nextVal)
            }
        }
    }
}

function insert(child, parent:HTMLElement, anchor) {
    // console.log('parent->',parent);
    // console.log('child->',child);
    // console.log('a->',anchor);
    parent.insertBefore(child, anchor || null)
}

function remove(child) {
    const parent = child.parentNode;
    if (parent) {
        parent.removeChild(child);
    }
}

function setElementText(el, text) {
    el.textContent = text;
}

const renderer: any = createRenderer({
    createElement,
    patchProp,
    insert,
    remove,
    setElementText
})

export function createApp(...arg) {
    return renderer.createApp(...arg)
}

export * from '../runtime-core'