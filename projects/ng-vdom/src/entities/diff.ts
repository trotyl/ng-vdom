import { IterableDiffer, KeyValueDiffer } from '@angular/core'
import { getCurrentIterableDiffers, getCurrentKeyValueDiffers } from './context'
import { isObject } from './lang'
import { isComponentElement, isNativeElement, isVElement, isVText, ComponentType, VNode } from './types'

function keyOf(node: VNode): string | number | null {
  return isObject(node) && node.key ? node.key : null
}

const componentCounter = new WeakMap<ComponentType<any>, number>()

function stringifyComponentType(type: ComponentType<any>): string {
  if (!componentCounter.has(type)) {
    componentCounter.set(type, 0)
  }
  const count = componentCounter.get(type)!
  return `${(type as Function).name}_${count}`
}

function stringifyNodeType(node: VNode): string {
  if (isVElement(node)) {
    if (isNativeElement(node)) {
      return `$$element_${node.type}`
    } else if (isComponentElement(node)) {
      return `$$component_${stringifyComponentType(node.type)}`
    } else {
      return `$$unknown`
    }
  } else if (isVText(node)) {
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

export function trackByKey(index: number, node: VNode): string {
  const nodeType = stringifyNodeType(node)
  const key = keyOf(node)
  const suffix = key == null ? `index_${indexOfType(index, nodeType)}` : `key_${key}`
  return `${nodeType}_${suffix}`
}

export function createPropDiffer(): KeyValueDiffer<string, any> {
  return getCurrentKeyValueDiffers().find({}).create()
}

export function createChildDiffer(): IterableDiffer<VNode> {
  return getCurrentIterableDiffers().find([]).create(trackByKey)
}
