import { isNil } from '../shared/lang'
import { RenderKit } from '../shared/render-kit'
import { VNode } from '../shared/types'
import { createComment, insertBefore } from './render'

export function mountVoid(kit: RenderKit, vNode: VNode, container: Element | null, nextNode: Node | null): void {
  const comment = vNode.native = createComment(kit, '')

  if (!isNil(container)) {
    insertBefore(kit, container, comment, nextNode)
  }
}

export function patchVoid(lastVNode: VNode, nextVNode: VNode): void {
  nextVNode.native = lastVNode.native
}

export function unmountVoid(kit: RenderKit, vNode: VNode): void {}
