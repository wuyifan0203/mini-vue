import { Fragment, createVNode } from "../vnode";

export function renderSlots(slots, key, params) {
    const slot = slots[key];
    if (slot) {
        if (typeof slot === 'function') {
            return createVNode(Fragment, {}, slot(params))
        }
    }
}