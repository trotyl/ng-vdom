import { isNil } from '../shared/lang'
import { RenderKit } from '../shared/render-kit'
import { VNode } from '../shared/types'
import { createTextNode, insertBefore, setNodeValue } from './render'

export function mountText(kit: RenderKit, vNode: VNode, container: Element | null, nextNode: Node | null): void {
  const props = vNode.props as { textContent: string }
  const text = vNode.native = createTextNode(kit, props.textContent)

  if (!isNil(container)) {
    insertBefore(kit, container, text, nextNode)
  }
}

export function patchText(kit: RenderKit, lastVNode: VNode, nextVNode: VNode): void {
  nextVNode.native = lastVNode.native

  const lastText = (lastVNode.props as { textContent: string }).textContent
  const nextText = (nextVNode.props as { textContent: string }).textContent

  if (lastText === nextText) { return }

  setNodeValue(kit, lastVNode.native!, nextText)
}

export function unmountText(kit: RenderKit, vNode: VNode): void {}
