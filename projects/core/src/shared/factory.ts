import './jsx'
import { ClassComponentType, ElementDef, FunctionComponentType, NodeDef } from './types'

export function createElement<P = any>(type: ClassComponentType<P> | FunctionComponentType<P> | string, props?: P, ...children: NodeDef[]): ElementDef<P> {
  return { type, props: props || null, children }
}
