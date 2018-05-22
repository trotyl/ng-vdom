import { ElementRef, Renderer2, KeyValueDiffers } from '@angular/core'
import { ReactElement, ReactNode, DOMElement, HTMLAttributes, ComponentElement, ReactChild } from 'react'
import { mountProps } from './props'
import { isComponent, isDomElement, isText, createClassComponentInstance } from './utils'
import { setVNode, getChildren, getChildNodes } from './registry'

export function mount(node: ReactNode, container: Element | null, renderer: Renderer2): Node {
  if (isDomElement(node)) {
    return mountElement(node, container, renderer)
  }

  if (isComponent(node)) {
    return mountComponent(node, container)
  }

  if (isText(node)) {
    return mountText(node, container, renderer)
  }

  throw new Error(`Unsupported node type: ${node}`)
}

export function mountElement(element: DOMElement<HTMLAttributes<HTMLElement>, HTMLElement>, container: Element | null, renderer: Renderer2): Node {
  const el = renderer.createElement(element.type) as Element
  const { children, className, ...props } = element.props

  if (className != null && className !== '') {
    renderer.addClass(el, className)
  }

  if (container) {
    renderer.appendChild(container, el)
  }

  if (children != null) {
    const childrenInArray = Array.isArray(children) ? children : [children]
    mountArrayChildren(childrenInArray, el, renderer)
  }

  setVNode(el, element)
  mountProps(props, el, renderer)

  return el
}

export function mountArrayChildren(children: ReactNode[], container: Element, renderer: Renderer2): void {
  const differ = getChildren(container)
  const childNodes = getChildNodes(container)

  const changes = differ.diff(children)
  if (changes) {
    changes.forEachAddedItem(record => {
      const childNode = mount(record.item, container, renderer)
      childNodes.push(childNode)
    })
  }
}

export function mountComponent(element: ComponentElement<any, any>, container: Element | null): Node {
  // TODO: add support for component
  throw new Error(`Component not supported yet`)
}

export function mountText(node: string | number | boolean, container: Element | null, renderer: Renderer2): Node {
  const text = renderer.createText(`${node}`) as Text

  if (container) {
    renderer.appendChild(container, text)
  }

  setVNode(text, node)

  return text
}
