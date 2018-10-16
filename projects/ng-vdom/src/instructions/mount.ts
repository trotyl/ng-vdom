import { IterableDiffer, KeyValueDiffer } from '@angular/core'
import { Component } from '../shared/component'
import { getCurrentRenderer, queueLifeCycle } from '../shared/context'
import { createChildDiffer, createPropDiffer } from '../shared/diff'
import { ComponentLifecycle } from '../shared/lifecycle'
import { isComponentElement, isComponentType, isNativeElement, isVElement, isVText, ComponentElement, NativeElement, StatelessComponentElement, VNode, VText } from '../shared/node'
import { mountProps } from './props'
import { setChildNodes, setComponentMeta, setElementMeta } from './registry'

export function mount(node: VNode, container: Element | null): Node {
  let res: Node | null = null

  if (isVElement(node)) {
    if (isNativeElement(node)) {
      res = mountElement(node, container)
    } else if (isComponentElement(node)) {
      res = mountComponent(node, container)
    }
  } else if (isVText(node)) {
    res = mountText(node, container)
  }

  if (res == null) {
    throw new Error(`Unsupported node type: ${node}`)
  }

  if (container != null) {
    setChildNodes(container, [res])
  }

  return res
}

function mountElement(vNode: NativeElement, container: Element | null): Node {
  const renderer = getCurrentRenderer()
  const childDiffer = createChildDiffer()
  const propDiffer = createPropDiffer()

  const { props, children } = vNode
  const el = renderer.createElement(vNode.type) as Element

  if (container) {
    renderer.appendChild(container, el)
  }

  let childNodes: Node[] = []
  if (children.length > 0) {
    childNodes = mountArrayChildren(children, childDiffer, el)
  }

  const events = Object.create(null)
  mountProps(props, propDiffer, el, events)
  setElementMeta(vNode, { events, propDiffer, childDiffer })
  setChildNodes(el, childNodes)

  return el
}

function mountArrayChildren(vNodes: VNode[], differ: IterableDiffer<VNode>, container: Element): Node[] {
  const childNodes: Node[] = []
  const changes = differ.diff(vNodes)!

  changes.forEachAddedItem(record => {
    const childNode = mount(record.item, container)
    childNodes.push(childNode)
  })

  return childNodes
}

function mountComponent(vNode: ComponentElement | StatelessComponentElement, container: Element | null): Node {
  const { type, props } = vNode

  let input: VNode
  let propDiffer: KeyValueDiffer<string, any> | null = null
  let instance: Component<any, any> | null = null
  if (isComponentType(type)) {
    instance = new type(props)
    input = instance.render()
    mountClassComponentCallbacks(instance)
  } else {
    input = type(props)
    propDiffer = createPropDiffer()
    propDiffer.diff(props)
  }

  setComponentMeta(vNode, { input, propDiffer, instance })
  return mount(input, container)
}

function mountClassComponentCallbacks(instance: Component<any, any>): void {
  const instanceWithLifecycles = instance as ComponentLifecycle
  if (instanceWithLifecycles.componentDidMount != null) {
    queueLifeCycle(() => instanceWithLifecycles.componentDidMount!())
  }
}

function mountText(vNode: VText, container: Element | null): Node {
  const renderer = getCurrentRenderer()

  const text = renderer.createText(`${vNode}`) as Text

  if (container) {
    renderer.appendChild(container, text)
  }

  return text
}
