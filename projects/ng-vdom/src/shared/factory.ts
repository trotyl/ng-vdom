import { Component } from '../shared/component'
import { ComponentElement, ComponentType, NativeElement, StatelessComponentElement, StatelessComponentType, VElement } from '../shared/node'
import './jsx'

export function createElement<P>(type: ComponentType<P>, props?: P | null, ...children: any[]): ComponentElement
export function createElement<P>(type: StatelessComponentType<P>, props?: P | null, ...children: any[]): StatelessComponentElement
export function createElement<P>(type: string, props?: P | null, ...children: any[]): NativeElement
export function createElement<P>(type: ComponentType<P> | StatelessComponentType<P> | string, props: P | null = null, ...children: any[]): VElement {
  const key = props != null ? (props as any).key : null
  return {
    type,
    props,
    children,
    key,
  }
}
