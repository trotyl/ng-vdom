import { IterableDiffer, KeyValueDiffer } from '@angular/core'
import { getCurrentIterableDiffers, getCurrentKeyValueDiffers } from './context'
import { isNullOrUndefined, isObject, isString } from './lang'
import { VNode } from './types'

function keyOf(node: VNode): string | number | null {
  return isObject(node) && node.key ? node.key : null
}

let componentCounter = 0

function stringifyType(type: Function | string | null): string {
  if (isString(type)) { return type }
  if (isNullOrUndefined(type)) { return 'void'}
  return `${type.name}_${componentCounter++}`
}

function stringifyNodeType(vNode: VNode): string {
  return `type_${vNode.flags}_${stringifyType(vNode.type)}`
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

export function createPropertyDiffer(): KeyValueDiffer<string, unknown> {
  return getCurrentKeyValueDiffers().find({}).create()
}

export function createChildrenDiffer(): IterableDiffer<VNode> {
  return getCurrentIterableDiffers().find([]).create(trackByKey)
}
