export function isObject(value: any): value is object {
  return !!value && (typeof value === 'object')
}

export function isFunction(value: any): value is Function {
  return typeof value === 'function'
}
