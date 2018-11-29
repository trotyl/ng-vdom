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

export interface VNodeMeta {
  $PD: KeyValueDiffer<string, unknown> | null
  $CD: IterableDiffer<VNode> | null
  $RI: Component | null
  $IN: VNode | null
  $AI: object | null
  $CR: ComponentRef<any> | null
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
