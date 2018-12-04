import { createEmptyMeta, normalize } from '../shared/node'
import { RenderKit } from '../shared/render-kit'
import { FunctionComponentType, Properties, RENDER_RESULT, VNode } from '../shared/types'
import { mount } from './mount'
import { patch } from './patch'
import { unmount } from './unmount'

export function mountFunctionComponent(kit: RenderKit, vNode: VNode, container: Element | null, nextNode: Node | null): void {
  const type = vNode.type as FunctionComponentType
  const props = vNode.props as Properties | null

  const meta = vNode.meta = createEmptyMeta()
  const inner = meta[RENDER_RESULT] = normalize(type(props))

  mount(kit, inner, container, nextNode)
  vNode.native = inner.native
}

export function patchFunctionComponent(kit: RenderKit, lastVNode: VNode, nextVNode: VNode, container: Element): void {
  const meta = nextVNode.meta = lastVNode.meta!

  const type = nextVNode.type as FunctionComponentType
  const props = nextVNode.props as Properties
  const lastInner = meta[RENDER_RESULT]!
  const nextInner = meta[RENDER_RESULT] = normalize(type(props))

  patch(kit, lastInner, nextInner, container)
  nextVNode.native = nextInner.native
}

export function unmountFunctionComponent(kit: RenderKit, vNode: VNode): void {
  unmount(kit, vNode.meta![RENDER_RESULT]!)
}
