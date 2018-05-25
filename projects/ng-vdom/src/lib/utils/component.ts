import { ComponentElement, Component, ComponentClass } from 'react'
import { isFunction } from './lang'

export function createClassComponentInstance<P>(type: ComponentClass<P>, props: P): Component<any, any> {
  const instance = new type(props)

  if (isFunction(instance.componentWillMount)) {
    instance.componentWillMount()
  }

  return instance
}
