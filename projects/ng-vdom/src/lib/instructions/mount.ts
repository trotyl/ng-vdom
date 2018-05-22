import { ElementRef, Renderer2, KeyValueDiffers } from '@angular/core'
import { ReactElement, ReactNode, DOMElement, HTMLAttributes, ComponentElement, ReactChild, SFCElement, StatelessComponent } from 'react'
import { mountProps } from './props'
import { isComponentElement, isDOMElement, isTextElement, isClassComponent, createClassComponentInstance } from './utils'
import { renderer, setVNode, getChildren, getChildNodes } from './registry'

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

export function mountElement(element: DOMElement<any, any>, container: Element | null): Node {
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
    mountArrayChildren(childrenInArray, el)
  }

  mountProps(props, el)

  return el
}

export function mountArrayChildren(children: ReactNode[], container: Element): void {
  const differ = getChildren(container)
  const childNodes = getChildNodes(container)

  const changes = differ.diff(children)
  if (changes) {
    changes.forEachAddedItem(record => {
      const childNode = setVNode(mount(record.item, container), record.item)
      childNodes.push(childNode)
    })
  }
}

export function mountComponent(element: ComponentElement<any, any> | SFCElement<HTMLElement>, container: Element | null): Node {
  // TODO: add support for component

  const type = element.type
  const props = element.props

  if (isClassComponent(type)) {
    throw new Error(`Class component not supported yet`)
  } else {
    const inner = type(props)
    return mount(inner, container)
  }
}

export function mountText(node: string | number | boolean, container: Element | null): Node {
  const text = renderer.createText(`${node}`) as Text

  if (container) {
    renderer.appendChild(container, text)
  }

  return text
}
