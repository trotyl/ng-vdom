import { ReactNode, ReactElement, ReactText, ComponentElement, ComponentType, ComponentClass } from 'react'
import { ElementVNode, ComponentVNode } from '../definitions/vnode'
import { isObject, isFunction } from './lang'

export function isReactELement(element: ReactNode): element is ReactElement<any> {
  return isObject(element) && ('type' in element)
}

export function isReactText(element: ReactNode): element is ReactText {
  const type = typeof element
  return type === 'string' || type === 'number'
}

export function isDOMElement(element: ReactNode): element is ElementVNode {
  return isReactELement(element) && (typeof element.type === 'string')
}

export function isComponentElement(element: ReactNode): element is ComponentVNode {
  return isReactELement(element) && (typeof element.type === 'function')
}

export function isClassComponentElement(type: ComponentType<any>): type is ComponentClass<any> {
  const proto = type.prototype
  return proto != null && isFunction(proto.render)
}

export function isTextElement(element: ReactNode): element is ReactText {
  return isReactText(element)
}

export function nodeTypeOf(node: ReactNode): any {
  if (isDOMElement(node) || isComponentElement(node)) {
    return node.type
  } else if (isTextElement(node)) {
    return '$$text'
  } else {
    throw new Error(`...`)
  }
}
