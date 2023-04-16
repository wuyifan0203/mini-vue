import { getCurrentInstance } from "./component";

export function provide(key, value) {
    // 存
    const currentInstance: any = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        const parentProvides = currentInstance.parent?.provides;
        if (provides === parentProvides) {
            provides = currentInstance.provides = Object.create(parentProvides)
        }
        provides[key] = value;
    }
}

export function inject(key, defaultValue) {
    // 取
    const currentInstance: any = getCurrentInstance();
    if (currentInstance) {
        const { parent } = currentInstance;
        if (key in parent?.provides) {
            return parent.provides[key];
        } else if (defaultValue) {
            if (typeof defaultValue === 'function') {
                return defaultValue();
            } else {
                return defaultValue;
            }
        }
    }
}

