import { ElementRef, Renderer2, KeyValueDiffers, IterableDiffer, KeyValueDiffer } from '@angular/core'
import { ReactElement, ReactNode, DOMElement, HTMLAttributes, ComponentElement, ReactChild, SFCElement, StatelessComponent, ComponentClass, Component } from 'react'
import { TextVNode, ComponentVNode, ElementVNode } from '../definitions/vnode'
import { mountProps } from './props'
import { createClassComponentInstance } from '../utils/component'
import { getRenderer } from '../utils/context'
import { createChildDiffer, createPropDiffer } from '../utils/diff'
import { isComponentElement, isDOMElement, isTextElement, isClassComponentElement } from '../utils/vnode'
import { setElementMeta, setComponentMeta } from './registry'

export function mount(node: ReactNode, container: Element | null): Node {
  if (isDOMElement(node)) {
    return mountElement(node, container)
  }

  if (isComponentElement(node)) {
    return mountComponent(node, container)
  }

  if (isTextElement(node)) {
    return mountText(node, container)
  }

  throw new Error(`Unsupported node type: ${node}`)
}

export function mountElement(vNode: ElementVNode, container: Element | null): Node {
  const renderer = getRenderer()
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
    childNodes = mountArrayChildren(childrenInArray, childDiffer, el)
  }

  const events = Object.create(null)
  mountProps(props, propDiffer, el, events)
  setElementMeta(vNode, { events, propDiffer, childDiffer, childNodes })

  return el
}

export function mountArrayChildren(vNodes: ReactNode[], differ: IterableDiffer<ReactNode>, container: Element): Node[] {
  const childNodes: Node[] = []
  const changes = differ.diff(vNodes)

  if (changes) {
    changes.forEachAddedItem(record => {
      const childNode = mount(record.item, container)
      childNodes.push(childNode)
    })
  }

  return childNodes
}

export function mountComponent(vNode: ComponentVNode, container: Element | null): Node {
  const type = vNode.type
  const props = vNode.props

  let input: ReactNode
  let propDiffer: KeyValueDiffer<string, any> | null = null
  let instance: Component<any, any> | null = null
  if (isClassComponentElement(type)) {
    instance = createClassComponentInstance(type, props)
    input = instance.render()
  } else {
    input = type(props)
    propDiffer = createPropDiffer()
    propDiffer.diff(props)
  }

  setComponentMeta(vNode, { input, propDiffer, instance })
  return mount(input, container)
}

export function mountText(vNode: TextVNode, container: Element | null): Node {
  const renderer = getRenderer()

  const text = renderer.createText(`${vNode}`) as Text

  if (container) {
    renderer.appendChild(container, text)
  }

  return text
}
