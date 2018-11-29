import { TextDef } from '../shared/types'
import { VNodeFlags } from './flags'
import { isAngularComponent, isBoolean, isClassComponent, isFunction, isNullOrUndefined, isNumber, isString, EMPTY_OBJ } from './lang'
import { Key, NodeDef, Properties, VNode, VNodeMeta } from './types'

function createVoidNode(): VNode {
  return {
    type: null,
    children: null,
    key: null,
    props: EMPTY_OBJ,
    flags: VNodeFlags.Void,
    native: null,
    meta: null,
  }
}

function createTextNode(content: TextDef): VNode {
  return {
    type: null,
    children: null,
    key: null,
    props: { textContent: `${content}` },
    flags: VNodeFlags.Text,
    native: null,
    meta: null,
  }
}

export function createEmptyMeta(): VNodeMeta {
  return { $CD: null, $IN: null, $RI: null, $PD: null, $AI: null, $CR: null }
}

export function normalize(def: NodeDef): VNode {
  if (isBoolean(def) || isNullOrUndefined(def)) {
    return createVoidNode()
  }

  if (isString(def) || isNumber(def)) {
    return createTextNode(def)
  }

  const type = def.type
  const children = def.children.map(normalize)
  const defProps = def.props as Properties
  const native = null
  const meta = null
  let flags = 0
  let props: Properties = EMPTY_OBJ
  let key: Key | null = null

  if (!isNullOrUndefined(defProps)) {
    props = {}

    for (const prop in defProps) {
      if (prop === 'key') {
        key = defProps[prop] as Key
      } else {
        props[prop] = defProps[prop]
      }
    }
  }

  if (isString(type)) {
    flags |= VNodeFlags.Native
  } else if (isAngularComponent(type)) {
    flags |= VNodeFlags.AngularComponent
  } else if (isClassComponent(type)) {
    flags |= VNodeFlags.ClassComponent
  } else if (isFunction(type)) {
    flags |= VNodeFlags.FunctionComponent
  }

  return { type, children, key, props, flags, native, meta }
}
