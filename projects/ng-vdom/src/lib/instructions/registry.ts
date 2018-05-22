import { KeyValueDiffer, KeyValueDiffers, IterableDiffers, IterableDiffer } from '@angular/core'
import { ReactNode, ReactElement } from 'react'
import { trackByKey } from './utils'

let keyValueDiffers: KeyValueDiffers | null = null
let iterableDiffers: IterableDiffers | null = null

const eventsRegistry = new WeakMap<Element, { [name: string]: () => void }>()
const propsRegistry = new WeakMap<Element, KeyValueDiffer<string, any>>()
const childrenRegistry = new WeakMap<Element, IterableDiffer<ReactNode>>()
const vNodeRegistry = new WeakMap<Node, ReactNode>()
const childNodesRegistry = new WeakMap<Element, Node[]>()

export function init(kDiffers: KeyValueDiffers, iDiffers: IterableDiffers): void {
  keyValueDiffers = kDiffers
  iterableDiffers = iDiffers
}

export function getEvents(host: Element): { [name: string]: () => void } {
  if (!eventsRegistry.has(host)) {
    eventsRegistry.set(host, {})
  }
  return eventsRegistry.get(host)!
}

export function getProps(host: Element): KeyValueDiffer<string, any> {
  if (!propsRegistry.has(host)) {
    propsRegistry.set(host, keyValueDiffers!.find({}).create())
  }
  return propsRegistry.get(host)!
}

export function getChildren(host: Element): IterableDiffer<ReactNode> {
  if (!childrenRegistry.has(host)) {
    childrenRegistry.set(host, iterableDiffers!.find([]).create(trackByKey))
  }
  return childrenRegistry.get(host)!
}

export function setVNode<T extends Node>(host: T, vNode: ReactNode): T {
  vNodeRegistry.set(host, vNode)
  return host
}

export function getVNode(host: Node): ReactNode {
  if (!vNodeRegistry.has(host)) {
    vNodeRegistry.set(host, null)
  }
  return vNodeRegistry.get(host)!
}

export function getChildNodes(host: Element): Node[] {
  if (!childNodesRegistry.has(host)) {
    childNodesRegistry.set(host, [])
  }
  return childNodesRegistry.get(host)!
}
