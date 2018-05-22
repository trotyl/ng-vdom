import { ReactNode, DOMElement, ComponentElement, Component, ComponentClass, StatelessComponent } from 'react'
import { Type } from '@angular/core'

export function isDOMElement(element: ReactNode): element is DOMElement<any, any> {
  return !!element && (typeof element === 'object') && ('type' in element) && (typeof element.type === 'string')
}

export function isComponentElement(element: ReactNode): element is ComponentElement<any, any> {
  return !!element && (typeof element === 'object') && ('type' in element) && (typeof element.type === 'function')
}

export function isTextElement(element: ReactNode): element is string | number | boolean {
  return (typeof element === 'string') || (typeof element === 'number') || (typeof element === 'boolean')
}

export function isClassComponent(type: ComponentClass<any> | StatelessComponent<any>): type is ComponentClass<any> {
  return type.prototype && type.prototype.render
}

export function nodeTypeOf(node: ReactNode): any {
  if (isDOMElement(node) || isComponentElement(node)) {
    return node.type
  } else if (isTextElement(node)) {
    return '$$text'
  } else {
    return node
  }
}

function keyOf(node: ReactNode): string | number | null {
  return !!node && (typeof node === 'object') && ('key' in node) ? node.key : null
}

const componentCounter = new WeakMap<Type<any>, number>()

function stringifyComponentType(type: Type<any>): string {
  if (!componentCounter.has(type)) {
    componentCounter.set(type, 0)
  }
  const count = componentCounter.get(type)!
  return `${type.name}_${count}`
}

function stringifyNodeType(node: ReactNode): string {
  if (isDOMElement(node)) {
    return `$$element_${node.type}`
  } else if (isComponentElement(node)) {
    return `$$component_${stringifyComponentType(node.type)}`
  } else if (isTextElement(node)) {
    return `$$text`
  } else {
    return `$$unknown`
  }
}

let typeCounter: { [name: string]: number } = Object.create(null)

function indexOfType(index: number, type: string): number {
  if (index === 0) {
    typeCounter = Object.create(null)
  }
  if (!(type in typeCounter)) {
    typeCounter[type] = -1
  }
  return ++typeCounter[type]
}

export function trackByKey(index: number, node: ReactNode): string {
  const nodeType = stringifyNodeType(node)
  const key = keyOf(node)
  const suffix = key == null ? `index_${indexOfType(index, nodeType)}` : `key_${key}`
  return `${nodeType}_${suffix}`
}

export function createClassComponentInstance(element: ComponentElement<any, any>): Component {
  const instance = new element.type(element.props)

  if (typeof instance.componentWillMount === 'function') {
    instance.componentWillMount()
  }

  return instance
}
