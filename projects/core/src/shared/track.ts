import { isNil, isObj, isStr } from './lang'
import { VNode } from './types'

function keyOf(node: VNode): string | number | null {
  return isObj(node) && node.key ? node.key : null
}

let componentCounter = 0
const componentTypes = new WeakMap<Function, number>()

function stringifyType(type: Function | string | null): string {
  if (isStr(type)) { return type }
  if (isNil(type)) { return 'void' }

  let counter = componentTypes.get(type)
  if (!counter) {
    counter = componentCounter++
    componentTypes.set(type, counter)
  }

  return `${type.name}_${counter}`
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

