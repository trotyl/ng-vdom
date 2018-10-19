export const EMPTY_OBJ = {}

export function isObject(value: any): value is object {
  return value != null && (typeof value === 'object')
}

export function isFunction(value: any): value is Function {
  return typeof value === 'function'
}
