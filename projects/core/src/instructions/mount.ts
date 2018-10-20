import { IterableDiffer } from '@angular/core'
import { Component } from '../shared/component'
import { queueLifeCycle } from '../shared/context'
import { createChildrenDiffer, createPropertyDiffer } from '../shared/diff'
import { VNodeFlags } from '../shared/flags'
import { isNullOrUndefined, EMPTY_OBJ } from '../shared/lang'
import { ComponentLifecycle } from '../shared/lifecycle'
import { normalize } from '../shared/node'
import { ClassComponentType, FunctionComponentType, Properties, VNode } from '../shared/types'
import { createComment, createElement, createTextNode, insertBefore } from './operation'
import { initProperties } from './property'
import { setCurrentMeta } from './register'

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
  const childrenDiffer = createChildrenDiffer()
  const propertyDiffer = createPropertyDiffer()

  const meta = vNode.meta = { $PD: propertyDiffer, $CD: childrenDiffer, $IS: null, $IN: null }
  const previousMeta = setCurrentMeta(meta)

  const type = vNode.type as string
  const props = vNode.props as Properties
  const children = vNode.children

  const element = vNode.native = createElement(type)

  if (!isNullOrUndefined(children) && children.length > 0) {
    mountArrayChildren(children, childrenDiffer, element)
  }

  initProperties(element, props)

  if (!isNullOrUndefined(container)) {
    insertBefore(container, element, nextNode)
  }

  setCurrentMeta(previousMeta)
}

function mountClassComponent(vNode: VNode, container: Element | null, nextNode: Node | null): void {
  const type = vNode.type as ClassComponentType
  const props = vNode.props

  const instance = new type(props)
  const inner = normalize(instance.render())

  vNode.meta = { $IS: instance, $IN: inner, $PD: null, $CD: null }

  mount(inner, container, nextNode)
  vNode.native = inner.native
  mountClassComponentCallbacks(instance)
}

function mountFunctionComponent(vNode: VNode, container: Element | null, nextNode: Node | null): void {
  const type = vNode.type as FunctionComponentType
  const props = (vNode.props || EMPTY_OBJ) as { [key: string]: unknown }

  const inner = normalize(type(props))
  const propertyDiffer = createPropertyDiffer()
  propertyDiffer.diff(props)

  vNode.meta = { $IN: inner, $PD: propertyDiffer, $CD: null, $IS: null }

  mount(inner, container, nextNode)
  vNode.native = inner.native
}

function mountText(vNode: VNode, container: Element | null, nextNode: Node | null): void {
  const props = vNode.props as { textContent: string }
  const text = vNode.native = createTextNode(`${props.textContent}`)

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

function mountArrayChildren(vNodes: VNode[], differ: IterableDiffer<VNode>, container: Element): void {
  const changes = differ.diff(vNodes)!

  if (!isNullOrUndefined(changes)) {
    changes.forEachAddedItem(record => {
      mount(record.item, container, null)
    })
  }
}

function mountClassComponentCallbacks(instance: Component): void {
  const instanceWithLifecycles = instance as ComponentLifecycle
  if (instanceWithLifecycles.componentDidMount != null) {
    queueLifeCycle(() => instanceWithLifecycles.componentDidMount!())
  }
}
