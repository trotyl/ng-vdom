import { IterableDiffer, KeyValueDiffer } from '@angular/core'
import { ReactNode, Component } from 'react'
import { TextVNode, ComponentVNode, ElementVNode } from '../definitions/vnode'
import { mountProps } from './props'
import { createClassComponentInstance } from '../utils/component'
import { getCurrentRenderer, getCurrentUpdater } from '../utils/context'
import { createChildDiffer, createPropDiffer } from '../utils/diff'
import { isFunction } from '../utils/lang'
import { isComponentElement, isDOMElement, isTextElement, isClassComponentElement } from '../utils/vnode'
import { setElementMeta, setComponentMeta, setChildNodes } from './registry'

export function mount(node: ReactNode, container: Element | null, lifecycle: Function[]): Node {
  if (isDOMElement(node)) {
    return mountElement(node, container, lifecycle)
  }

  if (isComponentElement(node)) {
    return mountComponent(node, container, lifecycle)
  }

  if (isTextElement(node)) {
    return mountText(node, container)
  }

  throw new Error(`Unsupported node type: ${node}`)
}

export function mountElement(vNode: ElementVNode, container: Element | null, lifecycle: Function[]): Node {
  const renderer = getCurrentRenderer()
  const childDiffer = createChildDiffer()
  const propDiffer = createPropDiffer()

  const { children, className, ...props } = vNode.props
  const el = renderer.createElement(vNode.type) as Element

  if (className != null && className !== '') {
    renderer.setProperty(el, 'className', className)
  }

  if (container) {
    renderer.appendChild(container, el)
  }

  let childNodes: Node[] = []
  if (children != null) {
    const childrenInArray = Array.isArray(children) ? children : [children]
    childNodes = mountArrayChildren(childrenInArray, childDiffer, el, lifecycle)
  }

  const events = Object.create(null)
  mountProps(props, propDiffer, el, events)
  setElementMeta(vNode, { events, propDiffer, childDiffer })
  setChildNodes(el, childNodes)

  return el
}

export function mountArrayChildren(vNodes: ReactNode[], differ: IterableDiffer<ReactNode>, container: Element, lifecycle: Function[]): Node[] {
  const childNodes: Node[] = []
  const changes = differ.diff(vNodes)

  if (changes) {
    changes.forEachAddedItem(record => {
      const childNode = mount(record.item, container, lifecycle)
      childNodes.push(childNode)
    })
  }

  return childNodes
}

export function mountComponent(vNode: ComponentVNode, container: Element | null, lifecycle: Function[]): Node {
  const type = vNode.type
  const props = vNode.props

  let input: ReactNode
  let propDiffer: KeyValueDiffer<string, any> | null = null
  let instance: Component<any, any> | null = null
  if (isClassComponentElement(type)) {
    instance = createClassComponentInstance(type, props)
    overrideClassMethods(instance)
    input = instance.render()
    mountClassComponentCallbacks(instance, lifecycle)
  } else {
    input = type(props)
    propDiffer = createPropDiffer()
    propDiffer.diff(props)
  }

  setComponentMeta(vNode, { input, propDiffer, instance })
  return mount(input, container, lifecycle)
}

export function overrideClassMethods(instance: Component<any, any>): void {
  const boundUpdater = getCurrentUpdater()
  instance.setState = function (state: any, callback?: () => void) {
    boundUpdater.enqueueSetState(this, state, callback)
  }
}

export function mountClassComponentCallbacks(instance: Component<any, any>, lifecycle: Function[]): void {
  if (isFunction(instance.componentDidMount)) {
    lifecycle.push(() => instance.componentDidMount!())
  }
}

export function mountText(vNode: TextVNode, container: Element | null): Node {
  const renderer = getCurrentRenderer()

  const text = renderer.createText(`${vNode}`) as Text

  if (container) {
    renderer.appendChild(container, text)
  }

  return text
}
