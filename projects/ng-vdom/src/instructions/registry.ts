import { IterableDiffer, KeyValueDiffer } from '@angular/core'
import { Component, ComponentElement, NativeElement, VNode } from '../shared/types'

export interface ComponentMeta {
  input: VNode
  propDiffer: KeyValueDiffer<string, any> | null
  instance: Component | null
}

export interface Events {
  [name: string]: () => void
}

export interface ElementMeta {
  events: Events
  propDiffer: KeyValueDiffer<string, any>
  childDiffer: IterableDiffer<VNode>
}

const componentMetaRegistry = new WeakMap<ComponentElement, ComponentMeta>()
const elementMetaRegistry = new WeakMap<NativeElement, ElementMeta>()
const childNodesRegistry = new WeakMap<Element, Node[]>()

export function setComponentMeta(vNode: ComponentElement, meta: ComponentMeta): void {
  componentMetaRegistry.set(vNode, meta)
}

export function getComponentMeta(vNode: ComponentElement): ComponentMeta {
  return componentMetaRegistry.get(vNode)!
}

export function setElementMeta(vNode: NativeElement, meta: ElementMeta): void {
  elementMetaRegistry.set(vNode, meta)
}

export function getElementMeta(vNode: NativeElement): ElementMeta {
  return elementMetaRegistry.get(vNode)!
}

export function setChildNodes(container: Element, childNodes: Node[]): void {
  childNodesRegistry.set(container, childNodes)
}

export function getChildNodes(container: Element): Node[] {
  return childNodesRegistry.get(container)!
}
