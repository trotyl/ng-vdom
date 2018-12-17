import { Type } from '@angular/core'
import './jsx'
import { ChildDef, ClassComponentType, ElementDef, FunctionComponentType } from './types'

export function createElement<P = any>(type: ClassComponentType<P> | FunctionComponentType<P> | Type<any> | string, props?: P, ...children: ChildDef[]): ElementDef<P> {
  return { type, props: props || null, children }
}
