import { ElementRef, Type } from '@angular/core'
import { Component } from '../shared/component'
import { VNodeFlags } from '../shared/flags'
import { isNil } from '../shared/lang'
import { createEmptyMeta, normalize } from '../shared/node'
import { APPLICATION_REF, COMPONENT_FACTORY_RESOLVER, INJECTOR, LIFE_CYCLE_HOOKS, RenderKit } from '../shared/render-kit'
import { ANGULAR_COMPONENT_INSTANCE, ClassComponentType, CHILD_DIFFER, COMPONENT_INSTANCE, COMPONENT_REF, FunctionComponentType, Properties, RENDER_RESULT, VNode } from '../shared/types'
import { initProperties } from './property'
import { getCurrentMeta, setCurrentMeta } from './register'
import { createComment, createElement, createTextNode, insertBefore } from './render'
import { createChildDiffer } from './util'

export function mount(kit: RenderKit, vNode: VNode, container: Element | null, nextNode: Node | null): void {
  const flags = vNode.flags

  if (flags & VNodeFlags.Native) {
    mountElement(kit, vNode, container, nextNode)
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

function mountElement(kit: RenderKit, vNode: VNode, container: Element | null, nextNode: Node | null): void {
  const meta = vNode.meta = createEmptyMeta()
  const previousMeta = setCurrentMeta(meta)

  const type = vNode.type as string
  const props = vNode.props as Properties | null
  const children = vNode.children!

  const element = vNode.native = createElement(kit, type)

  if (!isNil(props)) {
    initProperties(kit, element, props)
  }

  mountChildren(kit, children, element)

  if (!isNil(container)) {
    insertBefore(kit, container, element, nextNode)
  }

  setCurrentMeta(previousMeta)
}

function mountClassComponent(kit: RenderKit, vNode: VNode, container: Element | null, nextNode: Node | null): void {
  const type = vNode.type as ClassComponentType
  const props = vNode.props as Properties | null
  const meta = vNode.meta = createEmptyMeta()

  const instance = meta[COMPONENT_INSTANCE] = new type(props)
  const inner = meta[RENDER_RESULT] = normalize(instance.render())

  mount(kit, inner, container, nextNode)
  vNode.native = inner.native
  mountClassComponentCallbacks(kit, instance)
}

function mountFunctionComponent(kit: RenderKit, vNode: VNode, container: Element | null, nextNode: Node | null): void {
  const type = vNode.type as FunctionComponentType
  const props = vNode.props as Properties | null

  const meta = vNode.meta = createEmptyMeta()
  const inner = meta[RENDER_RESULT] = normalize(type(props))

  mount(kit, inner, container, nextNode)
  vNode.native = inner.native
}

function mountText(kit: RenderKit, vNode: VNode, container: Element | null, nextNode: Node | null): void {
  const props = vNode.props as { textContent: string }
  const text = vNode.native = createTextNode(kit, props.textContent)

  if (!isNil(container)) {
    insertBefore(kit, container, text, nextNode)
  }
}

function mountVoid(kit: RenderKit, vNode: VNode, container: Element | null, nextNode: Node | null): void {
  const comment = vNode.native = createComment(kit, '')

  if (!isNil(container)) {
    insertBefore(kit, container, comment, nextNode)
  }
}

function mountAngularComponent(kit: RenderKit, vNode: VNode, container: Element | null, nextNode: Node | null): void {
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

export function mountChildren(kit: RenderKit, vNodes: VNode[], container: Element): void {
  if (vNodes.length === 0) { return }

  if (vNodes.length === 1) {
    return mount(kit, vNodes[0], container, null)
  }

  const meta = getCurrentMeta()
  meta[CHILD_DIFFER] = createChildDiffer(kit, vNodes)

  for (let i = 0; i < vNodes.length; i++) {
    mount(kit, vNodes[i], container, null)
  }
}

function mountClassComponentCallbacks(kit: RenderKit, instance: Component): void {
  const componentDidMount = instance.componentDidMount
  if (componentDidMount !== Component.prototype.componentDidMount) {
    const hooks = kit[LIFE_CYCLE_HOOKS]
    hooks.push(componentDidMount, instance)
  }
}
