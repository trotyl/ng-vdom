import { Component } from './component'

export const EMPTY_OBJ = {}

export function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean'
}

export function isClassComponent(value: any): value is Component {
  return isFunction(value) && value.prototype && !!value.prototype.isComponent
}

export function isFunction(value: any): value is Function {
  return typeof value === 'function'
}

export function isNullOrUndefined(value: any): value is null | undefined {
  return value == null
}

export function isNumber(value: any): value is number {
  return typeof value === 'number'
}

export function isObject(value: any): value is object {
  return (value != null) && (typeof value === 'object')
}

export function isString(value: any): value is string {
  return typeof value === 'string'
}
