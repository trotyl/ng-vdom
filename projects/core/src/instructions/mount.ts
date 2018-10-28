import { Component } from '../shared/component'
import { createChildrenDiffer, createPropertyDiffer } from '../shared/context'
import { queueLifeCycle } from '../shared/context'
import { VNodeFlags } from '../shared/flags'
import { isNullOrUndefined } from '../shared/lang'
import { ComponentLifecycle } from '../shared/lifecycle'
import { createEmptyMeta, normalize } from '../shared/node'
import { ClassComponentType, FunctionComponentType, Properties, VNode } from '../shared/types'
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

  const instance = meta.$IS = new type(props)
  const inner = meta.$IN = normalize(instance.render())

  mount(inner, container, nextNode)
  vNode.native = inner.native
  mountClassComponentCallbacks(instance)
}

function mountFunctionComponent(vNode: VNode, container: Element | null, nextNode: Node | null): void {
  const type = vNode.type as FunctionComponentType
  const props = vNode.props as Properties | null

  const meta = vNode.meta = createEmptyMeta()
  const inner = meta.$IN = normalize(type(props))

  if (!isNullOrUndefined(props)) {
    meta.$PD = createPropertyDiffer(props)
  }

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
  const comment = vNode.native = createComment('void')

  if (!isNullOrUndefined(container)) {
    insertBefore(container, comment, nextNode)
  }
}

export function mountChildren(vNodes: VNode[], container: Element): void {
  if (vNodes.length === 0) { return }

  if (vNodes.length === 1) {
    return mount(vNodes[0], container, null)
  }

  const meta = getCurrentMeta()
  meta.$CD = createChildrenDiffer(vNodes)

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
