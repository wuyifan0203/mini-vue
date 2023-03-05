export const extend = Object.assign;

export const isObject = value => value !== null && typeof value === 'object';

export const hasChange = (newValue,value) => !Object.is(newValue,value);

export const isOn = (key:string) =>  /^on[A-Z]/.test(key)