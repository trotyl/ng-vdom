import { VNodeFlags } from '../shared/flags'
import { COMPONENT_REF, RENDER_RESULT, VNode } from '../shared/types'
import { removeAllEventListeners } from './event'

export function unmount(vNode: VNode): void {
  if (vNode.flags & VNodeFlags.Native) {
    removeAllEventListeners(vNode.native as Element)
  } else if (vNode.flags & VNodeFlags.ClassComponent) {
    unmount(vNode.meta![RENDER_RESULT]!)
  } else if (vNode.flags & VNodeFlags.FunctionComponent) {
    unmount(vNode.meta![RENDER_RESULT]!)
  } else if (vNode.flags & VNodeFlags.AngularComponent) {
    const ref = vNode.meta![COMPONENT_REF]!
    ref.destroy()
  }
}
