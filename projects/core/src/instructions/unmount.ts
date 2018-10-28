import { VNodeFlags } from '../shared/flags'
import { VNode } from '../shared/types'
import { removeAllEventListeners } from './event'

export function unmount(vNode: VNode): void {
  if (vNode.flags & VNodeFlags.Native) {
    removeAllEventListeners(vNode.native as Element)
  } else if (vNode.flags & VNodeFlags.ClassComponent) {
    unmount(vNode.meta!.$IN!)
  } else if (vNode.flags & VNodeFlags.FunctionComponent) {
    unmount(vNode.meta!.$IN!)
  }
}
