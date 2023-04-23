export const extend = Object.assign;

export const isObject = value => value !== null && typeof value === 'object';

export const hasChange = (newValue,value) => !Object.is(newValue,value);

export const isOn = (key:string) =>  /^on[A-Z]/.test(key);

export const hasOwn = (val,key) => Object.prototype.hasOwnProperty.call(val,key);

export const capitalize = (key:string):string => key.charAt(0).toUpperCase() + key.slice(1);

export const toHadelKey = (key:string):string => key ? 'on' + capitalize(key) : '';

export const camelize = (key:string):string => key.replace(/-(\w)/g,(_,c:string)=>c ? c.toUpperCase():'')

export const EMPTY_OBJ = {}