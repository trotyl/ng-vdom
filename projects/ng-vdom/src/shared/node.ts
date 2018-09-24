import { Component } from './component'
import { isObject } from './lang'

export type Key = string | number

export interface Attributes {
  key?: Key
}

export interface ClassAttributes extends Attributes {
  ref?: any
}

export interface ComponentType<P = any> {
  new(props: P): Component
}

export type StatelessComponentType<P = any> = (props: P) => VNode

export interface VElement<P = any> {
  type: ComponentType<P> | StatelessComponentType<P> | string
  props: P
  children: any[]
  key?: string | number
}

export interface ComponentElement<P = any> extends VElement<P> {
  type: ComponentType<P>
}

export interface StatelessComponentElement<P = any> extends VElement<P> {
  type: StatelessComponentType<P>
}

export interface NativeElement<P = any> extends VElement<P> {
  type: string
}

export type VText = string | number

export type VNode = VElement | VText

export function isVElement(element: VNode): element is VElement {
  return isObject(element) && ('type' in element)
}

export function isVText(element: VNode): element is VText {
  const type = typeof element
  return type === 'string' || type === 'number'
}

export function isNativeElement(element: VElement): element is NativeElement {
  return typeof element.type === 'string'
}

export function isComponentElement(element: VElement): element is ComponentElement {
  return typeof element.type === 'function'
}

export function isComponentType(type: ComponentType | StatelessComponentType): type is ComponentType {
  return !!(type as Function).prototype.isComponent
}

export function nodeTypeOf(node: VNode): any {
  if (isVElement(node)) {
    return node.type
  } else if (isVText(node)) {
    return '$$text'
  } else {
    throw new Error(`...`)
  }
}
