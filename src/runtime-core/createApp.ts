/*
 * @Author: wuyifan 1208097313@qq.com
 * @Date: 2023-02-23 23:52:25
 * @LastEditors: wuyifan 1208097313@qq.com
 * @LastEditTime: 2023-04-18 23:12:35
 * @FilePath: /my-vue/src/runtime-core/createApp.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { createVNode } from "./vnode"

export function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer){
                // 1.现转化为vnode
                // 2.对node做处理
                const vnode = createVNode(rootComponent);
    
                render(vnode,rootContainer)
    
            }
        }
    }
}

