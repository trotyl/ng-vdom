import { VNodeFlags } from '../shared/flags'
import { RenderKit } from '../shared/render-kit'
import { VNode } from '../shared/types'
import { mountAngularComponent } from './angular-component'
import { mountClassComponent } from './class-component'
import { mountFunctionComponent } from './function-component'
import { mountIntrinsic } from './intrinsic'
import { mountText } from './text'
import { mountVoid } from './void'

export function mount(kit: RenderKit, vNode: VNode, container: Element | null, nextNode: Node | null): void {
  const flags = vNode.flags

  if (flags & VNodeFlags.Intrinsic) {
    mountIntrinsic(kit, vNode, container, nextNode)
  } else if (flags & VNodeFlags.ClassComponent) {
    mountClassComponent(kit, vNode, container, nextNode)
  } else if (flags & VNodeFlags.FunctionComponent) {
    mountFunctionComponent(kit, vNode, container, nextNode)
  } else if (flags & VNodeFlags.Text) {
    mountText(kit, vNode, container, nextNode)
  } else if (flags & VNodeFlags.Void) {
    mountVoid(kit, vNode, container, nextNode)
  } else if (flags & VNodeFlags.AngularComponent) {
    mountAngularComponent(kit, vNode, container, nextNode)
  } else {
    throw new Error(`Unsupported node type: ${vNode}`)
  }
}
