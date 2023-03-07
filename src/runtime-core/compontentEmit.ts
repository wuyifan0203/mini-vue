import { camelize, toHadelKey } from "../shared/index";

export function emit(instance, eventName: string, ...arg) {
    console.log(eventName);
    const { props } = instance;

    const handler = props[toHadelKey(camelize(eventName))];
    handler && handler(...arg)

}