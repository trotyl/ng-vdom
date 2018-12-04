
import { KeyValueChangeRecord } from '@angular/core'
import { isNil } from '../shared/lang'
import { createEmptyMeta } from '../shared/node'
import { RenderKit, RENDERER } from '../shared/render-kit'
import { CHILD_DIFFER, Properties, PROP_DIFFER, Styles, VNode } from '../shared/types'
import { mount } from './mount'
import { patch } from './patch'
import { createElement, insertBefore, removeChild } from './render'
import { createChildDiffer, createPropDiffer, isEventLikeProp, parseEventName } from './util'

export function mountNative(kit: RenderKit, vNode: VNode, container: Element | null, nextNode: Node | null): void {
  vNode.meta = createEmptyMeta()

  const type = vNode.type as string
  const props = vNode.props as Properties | null
  const children = vNode.children!

  const element = vNode.native = createElement(kit, type)

  if (!isNil(props)) {
    patchProperties(kit, vNode, props)
  }

  mountChildren(kit, vNode, children, element)

  if (!isNil(container)) {
    insertBefore(kit, container, element, nextNode)
  }
}

export function patchNative(kit: RenderKit, lastVNode: VNode, nextVNode: VNode): void {
  nextVNode.meta = lastVNode.meta!

  const lastChildren = lastVNode.children!
  const lastProps = lastVNode.props
  const nextChildren = nextVNode.children!
  const nextProps = nextVNode.props as Properties

  const element = nextVNode.native = lastVNode.native! as Element

  if (lastProps !== nextProps) {
    patchProperties(kit, nextVNode, nextProps)
  }
  if (lastChildren !== nextChildren) {
    patchChildren(kit, nextVNode, lastChildren, nextChildren, element)
  }
}

export function unmountNative(kit: RenderKit, vNode: VNode): void {
  removeAllEventListeners(vNode.native as Element)
}

function mountChildren(kit: RenderKit, parent: VNode, vNodes: VNode[], container: Element): void {
  if (vNodes.length === 0) { return }

  if (vNodes.length === 1) {
    return mount(kit, vNodes[0], container, null)
  }

  const meta = parent.meta!
  meta[CHILD_DIFFER] = createChildDiffer(kit, vNodes)

  for (let i = 0; i < vNodes.length; i++) {
    mount(kit, vNodes[i], container, null)
  }
}

function patchChildren(kit: RenderKit, parent: VNode, lastChildren: VNode[], nextChildren: VNode[], container: Element): void {
  const meta = parent.meta!

  if (lastChildren.length === 0) {
    delete meta[CHILD_DIFFER]
    return mountChildren(kit, parent, nextChildren, container)
  }

  if (lastChildren.length === 1 && nextChildren.length === 1) {
    delete meta[CHILD_DIFFER]
    return patch(kit, lastChildren[0], nextChildren[0], container)
  }

  const nodes = lastChildren.map(vNode => vNode.native!)
  const differ = meta[CHILD_DIFFER] = meta[CHILD_DIFFER] || createChildDiffer(kit, lastChildren)
  const changes = differ.diff(nextChildren)

  if (!isNil(changes)) {
    changes.forEachOperation(({ item, previousIndex, currentIndex }, temporaryPreviousIndex, temporaryCurrentIndex) => {
      if (isNil(previousIndex)) {
        mount(kit, item, null, null)
        insertByIndex(kit, container, item.native!, temporaryCurrentIndex!, nodes)
      } else if (isNil(temporaryCurrentIndex)) {
        removeByIndex(kit, container, temporaryPreviousIndex!, nodes)
      } else {
        moveByIndex(kit, container, temporaryPreviousIndex!, temporaryCurrentIndex, nodes)
        patch(kit, lastChildren[previousIndex], nextChildren[currentIndex!], container)
      }
    })

    changes.forEachIdentityChange(({ item, previousIndex }) => {
      patch(kit, lastChildren[previousIndex!], item, container)
    })
  } else {
    for (let i = 0; i < nextChildren.length; i++) {
      patch(kit, nextChildren[i], nextChildren[i], container)
    }
  }
}

function insertByIndex(kit: RenderKit, container: Element, node: Node, currentIndex: number, nodes: Node[]): void {
  const nextNode = currentIndex === nodes.length ? null : nodes[currentIndex]
  insertBefore(kit, container, node, nextNode)
  if (isNil(nextNode)) {
    nodes.push(node)
  } else {
    nodes.splice(currentIndex, 0, node)
  }
}

function moveByIndex(kit: RenderKit, container: Element, previousIndex: number, currentIndex: number, nodes: Node[]): void {
  const node = removeByIndex(kit, container, previousIndex, nodes)
  insertByIndex(kit, container, node, currentIndex, nodes)
}

function removeByIndex(kit: RenderKit, container: Element, previousIndex: number, nodes: Node[]): Node {
  const node = nodes[previousIndex]
  removeChild(kit, container, node)
  nodes.splice(previousIndex, 1)
  return node
}

function patchProperties(kit: RenderKit, vNode: VNode, props: Properties): void {
  if (Object.keys(props).length === 0) { return }

  const meta = vNode.meta!
  let differ = meta[PROP_DIFFER]
  if (isNil(differ)) {
    differ = meta[PROP_DIFFER] = createPropDiffer(kit)
  }
  const changes = differ.diff(props)

  if (!isNil(changes)) {
    const applyPropertyChange = createPropertyChangeCallback(kit, vNode.native! as Element)
    changes.forEachAddedItem(applyPropertyChange)
    changes.forEachChangedItem(applyPropertyChange)
    changes.forEachRemovedItem(applyPropertyChange)
  }
}

function setProperty(kit: RenderKit, element: Element, prop: string, value: unknown) {
  if (isEventLikeProp(prop)) {
    const eventName = parseEventName(prop)
    setEventListener(kit, element, eventName, value as EventListener)
  } else if (prop === 'className' && value == null) {
    const renderer = kit[RENDERER]
    renderer.setProperty(element, prop, '')
  } else if (prop === 'style') {
    setStyle(kit, element, value as Styles | string)
  } else {
    const renderer = kit[RENDERER]
    renderer.setProperty(element, prop, value)
  }
}

function createPropertyChangeCallback(kit: RenderKit, element: Element) {
  return ({ key, currentValue }: KeyValueChangeRecord<string, unknown>) => setProperty(kit, element, key, currentValue)
}


function setStyle(kit: RenderKit, element: Element, styles: Styles | string): void {
  // TODO: Diff styles
  kit[RENDERER].setProperty(element, 'style', styles)
}


const EVENTS_KEY = '__niro_events__'

interface EventHandlers {
  [name: string]: () => void
}

function setEventListener(kit: RenderKit, element: Element, eventName: string, listener: EventListener): void {
  const events = getEventHandlers(element)
  const disposer: (() => void) | undefined = events[eventName]
  if (!isNil(disposer)) {
    disposer()
  }
  events[eventName] = kit[RENDERER].listen(element, eventName, listener)
}

function removeAllEventListeners(element: Element): void {
  const events = getEventHandlers(element)
  for (const eventName in events) {
    events[eventName]()
  }
}

function getEventHandlers(element: Element): EventHandlers {
  const untypedElement = element as { [key: string]: unknown }
  if (!untypedElement[EVENTS_KEY]) {
    untypedElement[EVENTS_KEY] = Object.create(null)
  }
  return untypedElement[EVENTS_KEY] as EventHandlers
}
