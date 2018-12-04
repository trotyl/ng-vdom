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

export const ANGULAR_INPUT_MAP = 0
export const ANGULAR_OUTPUT_MAP = 1
export const CHILD_DIFFER = 2
export const COMPONENT_INSTANCE = 3
export const COMPONENT_REF = 4
export const PROP_DIFFER = 5
export const RENDER_RESULT = 6

export interface VNodeMeta extends Array<unknown> {
  [ANGULAR_INPUT_MAP]?: { [key: string]: string }
  [ANGULAR_OUTPUT_MAP]?: { [key: string]: string }
  [CHILD_DIFFER]?: IterableDiffer<VNode>
  [COMPONENT_INSTANCE]?: Component
  [COMPONENT_REF]?: ComponentRef<any>
  [PROP_DIFFER]?: KeyValueDiffer<string, unknown>
  [RENDER_RESULT]?: VNode
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
