import { ComponentRef, IterableDiffer, KeyValueDiffer } from '@angular/core'
import { Component } from './component'

export interface ClassComponentType<P = any> {
  new(props: P): Component
}

export type FunctionComponentType<P = any> = (props: P) => NodeDef

export interface ElementDef<P = any> {
  type: string | ClassComponentType<P> | FunctionComponentType<P>
  children: NodeDef[]
  props: P | null
}

export type TextDef = string | number

export type VoidDef = boolean | null | undefined

export type NodeDef = ElementDef | TextDef | VoidDef

export type Key = string | number

export interface Attributes {
  key?: Key
}

export interface ClassAttributes {
  ref?: unknown
}

export const PROPERTY_DIFFER = 0
export const CHILDREN_DIFFER = 1
export const COMPONENT_INSTANCE = 2
export const RENDER_RESULT = 3
export const ANGULAR_COMPONENT_INSTANCE = 4
export const COMPONENT_REF = 5

export interface VNodeMeta {
  [PROPERTY_DIFFER]: KeyValueDiffer<string, unknown> | null
  [CHILDREN_DIFFER]: IterableDiffer<VNode> | null
  [COMPONENT_INSTANCE]: Component | null
  [RENDER_RESULT]: VNode | null
  [ANGULAR_COMPONENT_INSTANCE]: object | null
  [COMPONENT_REF]: ComponentRef<any> | null
}

export interface VNode<P = any> {
  type: string | ClassComponentType<P> | FunctionComponentType<P> | null
  children: VNode[] | null
  key: Key | null
  props: P
  flags: number
  native: Node | null
  meta: VNodeMeta | null
}

export interface Properties {
  [name: string]: unknown
}

export interface Styles {
  [name: string]: string
}

export type StateChange<S, P> = Partial<S> | ((s: S, p: P) => S)
