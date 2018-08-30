import { KeyValueDiffer, IterableDiffer } from '@angular/core'
import { ReactNode, ComponentType } from 'react'
import { getCurrentKeyValueDiffers, getCurrentIterableDiffers } from './context'
import { isDOMElement, isComponentElement, isTextElement } from './vnode'

function keyOf(node: ReactNode): string | number | null {
  return !!node && (typeof node === 'object') && ('key' in node) ? node.key : null
}

const componentCounter = new WeakMap<ComponentType<any>, number>()

function stringifyComponentType(type: ComponentType<any>): string {
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

export function createPropDiffer(): KeyValueDiffer<string, any> {
  return getCurrentKeyValueDiffers().find({}).create()
}

export function createChildDiffer(): IterableDiffer<ReactNode> {
  return getCurrentIterableDiffers().find([]).create(trackByKey)
}
