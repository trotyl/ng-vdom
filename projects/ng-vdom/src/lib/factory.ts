import { ComponentType, VElement } from './entities/types'
import './jsx'

export function createElement<P>(type: ComponentType<P> | string, props?: P | null, ...children: any[]): VElement {
  return {
    type,
    props: { ...props || {}, children },
    key: props != null && 'key' in props ? (props as any).key : undefined
  }
}

export { Component } from './entities/types'
