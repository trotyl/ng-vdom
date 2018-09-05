import { IterableDiffer, KeyValueDiffer } from '@angular/core'
import { getCurrentRenderer, getCurrentUpdateQueue } from '../entities/context'
import { createChildDiffer, createPropDiffer } from '../entities/diff'
import { isClassComponent, isComponentElement, isNativeElement, isVElement, isVText, Component, ComponentElement, ComponentLifecycle, NativeElement, VNode, VText } from '../entities/types'
import { mountProps } from './props'
import { setChildNodes, setComponentMeta, setElementMeta } from './registry'

export function mount(node: VNode, container: Element | null, lifecycle: Function[]): Node {
  if (isVElement(node)) {
    if (isNativeElement(node)) {
      return mountElement(node, container, lifecycle)
    } else if (isComponentElement(node)) {
      return mountComponent(node, container, lifecycle)
    }
  } else if (isVText(node)) {
    return mountText(node, container)
  }

  throw new Error(`Unsupported node type: ${node}`)
}

export function mountElement(vNode: NativeElement, container: Element | null, lifecycle: Function[]): Node {
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

export function mountArrayChildren(vNodes: VNode[], differ: IterableDiffer<VNode>, container: Element, lifecycle: Function[]): Node[] {
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

export function mountComponent(vNode: ComponentElement, container: Element | null, lifecycle: Function[]): Node {
  const type = vNode.type
  const props = vNode.props

  let input: VNode
  let propDiffer: KeyValueDiffer<string, any> | null = null
  let instance: Component<any, any> | null = null
  if (isClassComponent(type)) {
    instance = new type(props)
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
  const boundUpdater = getCurrentUpdateQueue()
  instance.setState = function (state: any, callback?: () => void) {
    boundUpdater.enqueueSetState(this, state, callback)
  }
}

export function mountClassComponentCallbacks(instance: Component<any, any>, lifecycle: Function[]): void {
  const instanceWithLifecycles = instance as ComponentLifecycle
  if (instanceWithLifecycles.componentDidMount != null) {
    lifecycle.push(() => instanceWithLifecycles.componentDidMount!())
  }
}

export function mountText(vNode: VText, container: Element | null): Node {
  const renderer = getCurrentRenderer()

  const text = renderer.createText(`${vNode}`) as Text

  if (container) {
    renderer.appendChild(container, text)
  }

  return text
}
