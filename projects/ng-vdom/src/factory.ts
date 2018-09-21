import './jsx'
import { ComponentType, VElement } from './shared/types'

export function createElement<P>(type: ComponentType<P> | string, props: P | null = null, ...children: any[]): VElement {
  return {
    type,
    props,
    children,
    key: props != null ? (props as any).key : undefined,
  }
}
