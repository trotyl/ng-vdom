import { ReactNode, DOMElement, ComponentElement, Component } from 'react'

export function isDomElement(element: ReactNode): element is DOMElement<any, any> {
  return !!element && (typeof element === 'object') && ('type' in element) && (typeof element.type === 'string')
}

export function isComponent(element: ReactNode): element is ComponentElement<any, any> {
  return !!element && (typeof element === 'object') && ('type' in element) && (typeof element.type === 'function')
}

export function isText(element: ReactNode): element is string | number | boolean {
  return (typeof element === 'string') || (typeof element === 'number') || (typeof element === 'boolean')
}

export function createClassComponentInstance(element: ComponentElement<any, any>): Component {
  const instance = new element.type(element.props)

  if (typeof instance.componentWillMount === 'function') {
    instance.componentWillMount()
  }

  return instance
}
