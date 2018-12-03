import { ElementRef, Type } from '@angular/core'
import { Component } from '../shared/component'
import { getCurrentApplicationRef, getCurrentInjector, queueLifeCycle } from '../shared/context'
import { createChildrenDiffer, getCurrentComponentFactoryResolver } from '../shared/context'
import { VNodeFlags } from '../shared/flags'
import { isNullOrUndefined } from '../shared/lang'
import { ComponentLifecycle } from '../shared/lifecycle'
import { createEmptyMeta, normalize } from '../shared/node'
import { ANGULAR_COMPONENT_INSTANCE, ClassComponentType, CHILDREN_DIFFER, COMPONENT_INSTANCE, COMPONENT_REF, FunctionComponentType, Properties, RENDER_RESULT, VNode } from '../shared/types'
import { initProperties } from './property'
import { getCurrentMeta, setCurrentMeta } from './register'
import { createComment, createElement, createTextNode, insertBefore } from './render'

export function mount(vNode: VNode, container: Element | null, nextNode: Node | null): void {
  const flags = vNode.flags

  if (flags & VNodeFlags.Native) {
    mountElement(vNode, container, nextNode)
  } else if (flags & VNodeFlags.ClassComponent) {
    mountClassComponent(vNode, container, nextNode)
  } else if (flags & VNodeFlags.FunctionComponent) {
    mountFunctionComponent(vNode, container, nextNode)
  } else if (flags & VNodeFlags.Text) {
    mountText(vNode, container, nextNode)
  } else if (flags & VNodeFlags.Void) {
    mountVoid(vNode, container, nextNode)
  } else if (flags & VNodeFlags.AngularComponent) {
    mountAngularComponent(vNode, container, nextNode)
  } else {
    throw new Error(`Unsupported node type: ${vNode}`)
  }
}

function mountElement(vNode: VNode, container: Element | null, nextNode: Node | null): void {
  const meta = vNode.meta = createEmptyMeta()
  const previousMeta = setCurrentMeta(meta)

  const type = vNode.type as string
  const props = vNode.props as Properties | null
  const children = vNode.children!

  const element = vNode.native = createElement(type)

  if (!isNullOrUndefined(props)) {
    initProperties(element, props)
  }

  mountChildren(children, element)

  if (!isNullOrUndefined(container)) {
    insertBefore(container, element, nextNode)
  }

  setCurrentMeta(previousMeta)
}

function mountClassComponent(vNode: VNode, container: Element | null, nextNode: Node | null): void {
  const type = vNode.type as ClassComponentType
  const props = vNode.props as Properties | null
  const meta = vNode.meta = createEmptyMeta()

  const instance = meta[COMPONENT_INSTANCE] = new type(props)
  const inner = meta[RENDER_RESULT] = normalize(instance.render())

  mount(inner, container, nextNode)
  vNode.native = inner.native
  mountClassComponentCallbacks(instance)
}

function mountFunctionComponent(vNode: VNode, container: Element | null, nextNode: Node | null): void {
  const type = vNode.type as FunctionComponentType
  const props = vNode.props as Properties | null

  const meta = vNode.meta = createEmptyMeta()
  const inner = meta[RENDER_RESULT] = normalize(type(props))

  mount(inner, container, nextNode)
  vNode.native = inner.native
}

function mountText(vNode: VNode, container: Element | null, nextNode: Node | null): void {
  const props = vNode.props as { textContent: string }
  const text = vNode.native = createTextNode(props.textContent)

  if (!isNullOrUndefined(container)) {
    insertBefore(container, text, nextNode)
  }
}

function mountVoid(vNode: VNode, container: Element | null, nextNode: Node | null): void {
  const comment = vNode.native = createComment('')

  if (!isNullOrUndefined(container)) {
    insertBefore(container, comment, nextNode)
  }
}

function mountAngularComponent(vNode: VNode, container: Element | null, nextNode: Node | null): void {
  const resolver = getCurrentComponentFactoryResolver()
  const factory = resolver.resolveComponentFactory(vNode.type as Type<any>)
  const injector = getCurrentInjector()

  const meta = vNode.meta = createEmptyMeta()
  // TODO: mount children as projectableNodes
  const ref = meta[COMPONENT_REF] = factory.create(injector)
  const instance = meta[ANGULAR_COMPONENT_INSTANCE] = ref.instance
  const app = getCurrentApplicationRef()
  app.attachView(ref.hostView)
  Object.assign(instance, vNode.props)

  const element = vNode.native = ref.injector.get(ElementRef as Type<ElementRef>).nativeElement

  if (!isNullOrUndefined(container)) {
    insertBefore(container, element, nextNode)
  }
}

export function mountChildren(vNodes: VNode[], container: Element): void {
  if (vNodes.length === 0) { return }

  if (vNodes.length === 1) {
    return mount(vNodes[0], container, null)
  }

  const meta = getCurrentMeta()
  meta[CHILDREN_DIFFER] = createChildrenDiffer(vNodes)

  for (let i = 0; i < vNodes.length; i++) {
    mount(vNodes[i], container, null)
  }
}

function mountClassComponentCallbacks(instance: Component): void {
  const instanceWithLifecycles = instance as ComponentLifecycle
  if (instanceWithLifecycles.componentDidMount != null) {
    queueLifeCycle(() => instanceWithLifecycles.componentDidMount!())
  }
}
