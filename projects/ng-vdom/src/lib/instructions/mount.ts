import { ElementRef, Renderer2 } from '@angular/core'
import { ReactElement, ReactNode, DOMElement, HTMLAttributes, ComponentElement } from 'react'
import { mountProps } from './props'
import { isComponent, isDomElement, isText, createClassComponentInstance } from './utils'

export function mount(element: ReactNode, container: Element, renderer: Renderer2) {
  if (Array.isArray(element)) {
    return mountArray(element, container, renderer)
  }

  if (isDomElement(element)) {
    return mountElement(element, container, renderer)
  }

  if (isComponent(element)) {
    return mountComponent(element, container)
  }

  if (isText(element)) {
    return mountText(element, container, renderer)
  }
}

export function mountArray(elements: ReactNode[], container: Element, renderer: Renderer2): void {
  for (let i = 0, len = elements.length; i < len; i++) {
    mount(elements[i], container, renderer)
  }
}

export function mountElement(element: DOMElement<HTMLAttributes<HTMLElement>, HTMLElement>, container: Element, renderer: Renderer2) {
  const el = renderer.createElement(element.type)
  const { children, className, ...props } = element.props

  if (className != null && className !== '') {
    renderer.addClass(el, className)
  }

  renderer.appendChild(container, el)

  if (children != null) {
    mount(children, el, renderer)
  }

  mountProps(props, el, renderer)
}

export function mountComponent(element: ComponentElement<any, any>, container: Element) {
  // TODO: add support for component
}

export function mountText(element: string | number | boolean, container: Element, renderer: Renderer2): void {
  const text = renderer.createText(`${element}`)
  renderer.appendChild(container, text)
}
