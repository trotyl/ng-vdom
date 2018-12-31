import { VNodeFlags } from '../shared/flags'
import { RenderKit } from '../shared/render-kit'
import { VNode } from '../shared/types'
import { patchAngularComponent } from './angular-component'
import { patchClassComponent } from './class-component'
import { patchFunctionComponent } from './function-component'
import { mount } from './mount'
import { patchNative } from './native'
import { detach, parentNodeOf } from './render'
import { patchText } from './text'
import { unmount } from './unmount'
import { patchVoid } from './void'

export function patch(kit: RenderKit, lastVNode: VNode, nextVNode: VNode): void {
  const nextFlags = nextVNode.flags

  if (lastVNode.flags !== nextVNode.flags || lastVNode.type !== nextVNode.type || lastVNode.key !== nextVNode.key) {
    replaceWithNewNode(kit, lastVNode, nextVNode)
  } else if (nextFlags & VNodeFlags.Native) {
    patchNative(kit, lastVNode, nextVNode)
  } else if (nextFlags & VNodeFlags.ClassComponent) {
    patchClassComponent(kit, lastVNode, nextVNode)
  } else if (nextFlags & VNodeFlags.FunctionComponent) {
    patchFunctionComponent(kit, lastVNode, nextVNode)
  } else if (nextFlags & VNodeFlags.Text) {
    patchText(kit, lastVNode, nextVNode)
  } else if (nextFlags & VNodeFlags.Void) {
    patchVoid(lastVNode, nextVNode)
  } else if (nextFlags & VNodeFlags.AngularComponent) {
    patchAngularComponent(kit, lastVNode, nextVNode)
  } else {
    throw new Error(`Unsupported node type ${nextVNode.type}`)
  }
}

function replaceWithNewNode(kit: RenderKit, lastVNode: VNode, nextVNode: VNode): void {
  const lastNode = lastVNode.native
  let container: Element
  if (lastNode == null || (container = parentNodeOf(kit, lastNode)) == null) {
    return
  }

  unmount(kit, lastVNode)
  mount(kit, nextVNode, container, lastNode)
  detach(kit, lastNode)
}
