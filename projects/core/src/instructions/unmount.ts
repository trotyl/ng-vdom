import { VNodeFlags } from '../shared/flags'
import { RenderKit } from '../shared/render-kit'
import { VNode } from '../shared/types'
import { unmountAngularComponent } from './angular-component'
import { unmountClassComponent } from './class-component'
import { unmountFunctionComponent } from './function-component'
import { unmountNative } from './native'
import { detach } from './render'
import { unmountText } from './text'
import { unmountVoid } from './void'

export function unmount(kit: RenderKit, vNode: VNode): void {
  if (vNode.flags & VNodeFlags.Native) {
    unmountNative(kit, vNode)
  } else if (vNode.flags & VNodeFlags.ClassComponent) {
    unmountClassComponent(kit, vNode)
  } else if (vNode.flags & VNodeFlags.FunctionComponent) {
    unmountFunctionComponent(kit, vNode)
  } else if (vNode.flags & VNodeFlags.Text) {
    unmountText(kit, vNode)
  } else if (vNode.flags & VNodeFlags.Void) {
    unmountVoid(kit, vNode)
  } else if (vNode.flags & VNodeFlags.AngularComponent) {
    unmountAngularComponent(kit, vNode)
  }
}

// TODO: add test
export function destroy(kit: RenderKit, vNode: VNode): void {
  unmount(kit, vNode)
  detach(kit, vNode.native!)
}
