import { VNodeFlags } from '../shared/flags'
import { RenderKit } from '../shared/render-kit'
import { COMPONENT_REF, RENDER_RESULT, VNode } from '../shared/types'
import { removeAllEventListeners } from './event'

export function unmount(kit: RenderKit, vNode: VNode): void {
  if (vNode.flags & VNodeFlags.Native) {
    removeAllEventListeners(kit, vNode.native as Element)
  } else if (vNode.flags & VNodeFlags.ClassComponent) {
    unmount(kit, vNode.meta![RENDER_RESULT]!)
  } else if (vNode.flags & VNodeFlags.FunctionComponent) {
    unmount(kit, vNode.meta![RENDER_RESULT]!)
  } else if (vNode.flags & VNodeFlags.AngularComponent) {
    const ref = vNode.meta![COMPONENT_REF]!
    ref.destroy()
  }
}
