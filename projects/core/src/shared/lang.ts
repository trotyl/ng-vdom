import { Type } from '@angular/core'
import { Component } from './component'
import { getCurrentRenderKit, COMPONENT_FACTORY_RESOLVER } from './render-kit'

export const EMPTY_ARRAY = []
export const EMPTY_OBJ = {}

export function isBool(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

export function isClassComp(value: unknown): value is Component {
  return isFunc(value) && value.prototype && !!value.prototype.isComponent
}

export function isFunc(value: unknown): value is Function {
  return typeof value === 'function'
}

export function isNgComp(value: unknown): value is Type<any> {
  try {
    const resolver = getCurrentRenderKit()![COMPONENT_FACTORY_RESOLVER]
    resolver.resolveComponentFactory(value as any)
    return true
  } catch {
    return false
  }
}

export function isNil(value: unknown): value is null | undefined {
  return value == null
}

export function isNum(value: unknown): value is number {
  return typeof value === 'number'
}

export function isObj(value: unknown): value is object {
  return (value != null) && (typeof value === 'object')
}

export function isStr(value: unknown): value is string {
  return typeof value === 'string'
}
