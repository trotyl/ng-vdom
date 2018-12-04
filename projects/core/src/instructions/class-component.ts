import { Component } from '../shared/component'
import { createEmptyMeta, normalize } from '../shared/node'
import { LIFECYCLE_HOOKS, RenderKit } from '../shared/render-kit'
import { ClassComponentType, COMPONENT_INSTANCE, Properties, RENDER_RESULT, VNode } from '../shared/types'
import { mount } from './mount'
import { patch } from './patch'
import { unmount } from './unmount'

export function mountClassComponent(kit: RenderKit, vNode: VNode, container: Element | null, nextNode: Node | null): void {
  const type = vNode.type as ClassComponentType
  const props = vNode.props as Properties | null
  const meta = vNode.meta = createEmptyMeta()

  const instance = meta[COMPONENT_INSTANCE] = new type(props)
  const inner = meta[RENDER_RESULT] = normalize(instance.render())

  mount(kit, inner, container, nextNode)
  vNode.native = inner.native
  mountClassComponentCallbacks(kit, instance)
}

export function patchClassComponent(kit: RenderKit, lastVNode: VNode, nextVNode: VNode, container: Element): void {
  const meta = nextVNode.meta = lastVNode.meta!

  const instance = meta[COMPONENT_INSTANCE]!
  const lastResult = meta[RENDER_RESULT]!

  const props = nextVNode.props as Properties

  (instance as { props: Properties }).props = props
  const nextResult = meta[RENDER_RESULT] = normalize(instance!.render())

  patch(kit, lastResult, nextResult, container)
  nextVNode.native = nextResult.native
}

export function unmountClassComponent(kit: RenderKit, vNode: VNode): void {
  unmount(kit, vNode.meta![RENDER_RESULT]!)
}

function mountClassComponentCallbacks(kit: RenderKit, instance: Component): void {
  const componentDidMount = instance.componentDidMount
  if (componentDidMount !== Component.prototype.componentDidMount) {
    const hooks = kit[LIFECYCLE_HOOKS]
    hooks.push(componentDidMount, instance)
  }
}
