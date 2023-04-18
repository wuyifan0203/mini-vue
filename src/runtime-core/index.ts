/*
 * @Author: wuyifan 1208097313@qq.com
 * @Date: 2023-02-23 23:51:51
 * @LastEditors: wuyifan 1208097313@qq.com
 * @LastEditTime: 2023-04-18 23:20:22
 * @FilePath: /my-vue/src/runtime-core/index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export { h } from './h';
export { renderSlots } from './helpers/renderSlots'
export { createTextVNode } from './vnode';
export { getCurrentInstance } from './component'
export { inject, provide } from './apiInject';
export { createRenderer } from './renderer'