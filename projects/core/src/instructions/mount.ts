import { IterableDiffer } from '@angular/core'
import { Component } from '../shared/component'
import { getCurrentRenderer, queueLifeCycle } from '../shared/context'
import { createChildrenDiffer, createPropertyDiffer } from '../shared/diff'
import { VNodeFlags } from '../shared/flags'
import { isNullOrUndefined, EMPTY_OBJ } from '../shared/lang'
import { ComponentLifecycle } from '../shared/lifecycle'
import { normalize } from '../shared/node'
import { ClassComponentType, FunctionComponentType, VNode } from '../shared/types'
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
  } else {
    throw new Error(`Unsupported node type: ${vNode}`)
  }
}

function mountElement(vNode: VNode, container: Element | null, nextNode: Node | null): void {
  const renderer = getCurrentRenderer()
  const childDiffer = createChildrenDiffer()
  const propertyDiffer = createPropertyDiffer()

  const meta = { $PD: propertyDiffer, $CD: childDiffer, $IS: null, $IN: null }
  const previousMeta = setCurrentMeta(meta)
  vNode.meta = meta

  const type = vNode.type as string
  const props = vNode.props
  const children = vNode.children

  const element = renderer.createElement(type) as Element
  vNode.native = element

  if (!isNullOrUndefined(children) && children.length > 0) {
    mountArrayChildren(children, childDiffer, element)
  }

  initProperties(element, props as any)

  if (!isNullOrUndefined(container)) {
    if (!isNullOrUndefined(nextNode)) {
      renderer.insertBefore(container, element, nextNode)
    } else {
      renderer.appendChild(container, element)
    }
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
  const props = (vNode.props || EMPTY_OBJ) as { [key: string]: any }

  const inner = normalize(type(props))
  const propertyDiffer = createPropertyDiffer()
  propertyDiffer.diff(props)

  vNode.meta = { $IN: inner, $PD: propertyDiffer, $CD: null, $IS: null }

  mount(inner, container, nextNode)
  vNode.native = inner.native
}

function mountText(vNode: VNode, container: Element | null, nextNode: Node | null): void {
  const props = vNode.props as { textContent: string }
  const renderer = getCurrentRenderer()

  const text = renderer.createText(`${props.textContent}`) as Text
  vNode.native = text

  if (!isNullOrUndefined(container)) {
    if (!isNullOrUndefined(nextNode)) {
      renderer.insertBefore(container, text, nextNode)
    } else {
      renderer.appendChild(container, text)
    }
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
