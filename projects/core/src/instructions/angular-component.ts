import { ElementRef, Type } from '@angular/core'
import { isNil } from '../shared/lang'
import { createEmptyMeta } from '../shared/node'
import { APPLICATION_REF, COMPONENT_FACTORY_RESOLVER, INJECTOR, RenderKit } from '../shared/render-kit'
import { ANGULAR_COMPONENT_INSTANCE, COMPONENT_REF, VNode } from '../shared/types'
import { insertBefore } from './render'

export function mountAngularComponent(kit: RenderKit, vNode: VNode, container: Element | null, nextNode: Node | null): void {
  const resolver = kit[COMPONENT_FACTORY_RESOLVER]
  const factory = resolver.resolveComponentFactory(vNode.type as Type<any>)
  const injector = kit[INJECTOR]

  const meta = vNode.meta = createEmptyMeta()
  // TODO: mount children as projectableNodes
  const ref = meta[COMPONENT_REF] = factory.create(injector)
  const instance = meta[ANGULAR_COMPONENT_INSTANCE] = ref.instance
  const app = kit[APPLICATION_REF]
  app.attachView(ref.hostView)
  Object.assign(instance, vNode.props)

  const element = vNode.native = ref.injector.get(ElementRef as Type<ElementRef>).nativeElement

  if (!isNil(container)) {
    insertBefore(kit, container, element, nextNode)
  }
}
