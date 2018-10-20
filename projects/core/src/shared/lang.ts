import { Component } from './component'
import { TextDef } from './types'

export const EMPTY_OBJ = {}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

export function isClassComponent(value: unknown): value is Component {
  return isFunction(value) && value.prototype && !!value.prototype.isComponent
}

export function isFunction(value: unknown): value is Function {
  return typeof value === 'function'
}

export function isNullOrUndefined(value: unknown): value is null | undefined {
  return value == null
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number'
}

export function isObject(value: unknown): value is object {
  return (value != null) && (typeof value === 'object')
}

export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

export function isText(value: unknown): value is TextDef {
  return isString(value) || isNumber(value)
}
