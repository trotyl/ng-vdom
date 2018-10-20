import { VNodeFlags } from './flags'
import { isBoolean, isClassComponent, isFunction, isNullOrUndefined, isNumber, isString } from './lang'
import { NodeDef, VNode } from './types'

export const EMPTY_NODE: VNode = {
  type: null,
  children: null,
  key: null,
  props: null,
  flags: VNodeFlags.Void,
  native: null,
  meta: null,
}

export function normalize(def: NodeDef): VNode {
  if (isBoolean(def) || isNullOrUndefined(def)) {
    return EMPTY_NODE
  }

  let flags = 0
  const native = null
  const meta = null

  if (isString(def) || isNumber(def)) {
    flags |= VNodeFlags.Text
    return {
      type: '',
      children: null,
      key: null,
      props: { textContent: def },
      flags, native, meta,
    }
  }

  let children: VNode[] | null = null
  const defChildren = def.children

  if (!isNullOrUndefined(defChildren)) {
    children = defChildren.map(normalize)
  }

  let props: { [key: string]: any } | null = null
  let key = null
  const defProps = def.props as { [key: string]: any } | null
  const type = def.type

  if (!isNullOrUndefined(defProps)) {
    props = {}
    for (const prop in defProps) {
      if (prop === 'key') {
        key = defProps[prop]
      } else {
        props[prop] = defProps[prop]
      }
    }
  }

  if (isString(type)) {
    flags |= VNodeFlags.Native
  } else if (isClassComponent(type)) {
    flags |= VNodeFlags.ClassComponent
  } else if (isFunction(type)) {
    flags |= VNodeFlags.FunctionComponent
  }

  return { type, children, key, props, flags, native, meta }
}
