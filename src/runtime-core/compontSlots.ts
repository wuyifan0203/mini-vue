import { ShapeFlag } from "../shared/ShapeFlag";

export function initSlots(instance,children) {
    // 不是所有都拥有slot
    if(instance.vnode.shapeFlag & ShapeFlag.SLOT_CHILDREN){
        const slots = {};
        for (const key in children) {
            const value = children[key]; // 这是一个函数，调用返回一个vnode
          
            slots[key] = (props)=> {
                const slotVnode = value(props);
                return Array.isArray(slotVnode)? slotVnode:[slotVnode];
            }
        }
    
        instance.slots = slots;
    }
}