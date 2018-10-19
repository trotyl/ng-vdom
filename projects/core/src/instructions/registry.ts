import { IterableDiffer, KeyValueDiffer } from '@angular/core'
import { Component } from '../shared/component'
import { illegalStateError } from '../shared/error'
import { ComponentElement, NativeElement, StatelessComponentElement, VNode } from '../shared/node'

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

const componentMetaRegistry = new WeakMap<ComponentElement | StatelessComponentElement, ComponentMeta>()
const elementMetaRegistry = new WeakMap<NativeElement, ElementMeta>()
const childNodesRegistry = new WeakMap<Element, Node[]>()

export function setComponentMeta(vNode: ComponentElement | StatelessComponentElement, meta: ComponentMeta): void {
  componentMetaRegistry.set(vNode, meta)
}

export function getComponentMeta(vNode: ComponentElement | StatelessComponentElement): ComponentMeta {
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
  if (!childNodesRegistry.has(container)) {
    return illegalStateError('node has no children registered!')
  }
  return childNodesRegistry.get(container)!
}
