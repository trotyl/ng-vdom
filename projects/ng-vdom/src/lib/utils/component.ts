import { ComponentElement, Component } from 'react'

export function createClassComponentInstance(element: ComponentElement<any, any>): Component<any, any> {
  const instance = new element.type(element.props)

  if (typeof instance.componentWillMount === 'function') {
    instance.componentWillMount()
  }

  return instance
}
