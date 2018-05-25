import { KeyValueDiffer, IterableDiffer } from '@angular/core'
import { ReactNode, ComponentClass, Component } from 'react'
import { ComponentVNode, ElementVNode } from '../definitions/vnode'

export interface ComponentMeta {
  input: ReactNode
  propDiffer: KeyValueDiffer<string, any> | null
  instance: Component<any, any> | null
}

export interface Events {
  [name: string]: () => void
}

export interface ElementMeta {
  events: Events
  propDiffer: KeyValueDiffer<string, any>
  childDiffer: IterableDiffer<ReactNode>
  childNodes: Node[]
}

const componentMetaRegistry = new WeakMap<ComponentVNode, ComponentMeta>()
const elementMetaRegistry = new WeakMap<ElementVNode, ElementMeta>()

export function setComponentMeta(vNode: ComponentVNode, meta: ComponentMeta): void {
  componentMetaRegistry.set(vNode, meta)
}

export function getComponentMeta(vNode: ComponentVNode): ComponentMeta {
  return componentMetaRegistry.get(vNode)!
}

export function setElementMeta(vNode: ElementVNode, meta: ElementMeta): void {
  elementMetaRegistry.set(vNode, meta)
}

export function getElementMeta(vNode: ElementVNode): ElementMeta {
  return elementMetaRegistry.get(vNode)!
}
