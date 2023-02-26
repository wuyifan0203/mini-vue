import { render } from "./renderer";
import { createVNode } from "./vnode"

export function createApp(rootComponent) {
    return {
        mount(rootContainer){
            // 1.现转化为vnode
            // 2.对node做处理
            const vnode = createVNode(rootComponent);

            render(vnode,rootContainer)

        }
    }

    
}

