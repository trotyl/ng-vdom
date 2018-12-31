import { VNodeFlags } from './flags'
import { isBool, isClassComp, isFunc, isNgComp, isNum, isStr, EMPTY_OBJ } from './lang'
import { ChildDef, Key, NodeDef, Properties, TextDef, VNode, VNodeMeta } from './types'

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
  return []
}

export function flatten(defs: ChildDef[]): NodeDef[] {
  return Array.prototype.concat.apply([], defs)
}

export function normalize(def: NodeDef): VNode {
  if (isBool(def) || def == null) {
    return createVoidNode()
  }

  if (isStr(def) || isNum(def)) {
    return createTextNode(def)
  }

  const type = def.type
  const children = flatten(def.children).map(normalize)
  const defProps = def.props as Properties
  const native = null
  const meta = null
  let flags = 0
  let props: Properties = EMPTY_OBJ
  let key: Key | null = null

  if (defProps != null) {
    props = {}

    for (const prop in defProps) {
      if (prop === 'key') {
        key = defProps[prop] as Key
      } else {
        props[prop] = defProps[prop]
      }
    }
  }

  if (isStr(type)) {
    flags |= VNodeFlags.Native
  } else if (isNgComp(type)) {
    flags |= VNodeFlags.AngularComponent
  } else if (isClassComp(type)) {
    flags |= VNodeFlags.ClassComponent
  } else if (isFunc(type)) {
    flags |= VNodeFlags.FunctionComponent
  }

  return { type, children, key, props, flags, native, meta }
}
