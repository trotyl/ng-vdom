
import { KeyValueChangeRecord } from '@angular/core'
import { isNil } from '../shared/lang'
import { createEmptyMeta } from '../shared/node'
import { RenderKit, RENDERER } from '../shared/render-kit'
import { CHILD_DIFFER, Properties, PROP_DIFFER, Styles, VNode } from '../shared/types'
import { mount } from './mount'
import { patch } from './patch'
import { getCurrentMeta, setCurrentMeta } from './register'
import { createElement, insertBefore, removeChild } from './render'
import { createChildDiffer, createPropDiffer } from './util'

export function mountNative(kit: RenderKit, vNode: VNode, container: Element | null, nextNode: Node | null): void {
  const meta = vNode.meta = createEmptyMeta()
  const previousMeta = setCurrentMeta(meta)

  const type = vNode.type as string
  const props = vNode.props as Properties | null
  const children = vNode.children!

  const element = vNode.native = createElement(kit, type)

  if (!isNil(props)) {
    initProperties(kit, element, props)
  }

  mountChildren(kit, children, element)

  if (!isNil(container)) {
    insertBefore(kit, container, element, nextNode)
  }

  setCurrentMeta(previousMeta)
}

export function patchNative(kit: RenderKit, lastVNode: VNode, nextVNode: VNode): void {
  const meta = nextVNode.meta = lastVNode.meta!
  const previousMeta = setCurrentMeta(meta)

  const lastChildren = lastVNode.children!
  const lastProps = lastVNode.props
  const nextChildren = nextVNode.children!
  const nextProps = nextVNode.props as Properties

  const element = nextVNode.native = lastVNode.native! as Element

  if (lastProps !== nextProps) {
    patchProperties(kit, element, nextProps)
  }
  if (lastChildren !== nextChildren) {
    patchChildren(kit, lastChildren, nextChildren, element)
  }

  setCurrentMeta(previousMeta)
}

export function unmountNative(kit: RenderKit, vNode: VNode): void {
  removeAllEventListeners(kit, vNode.native as Element)
}

function mountChildren(kit: RenderKit, vNodes: VNode[], container: Element): void {
  if (vNodes.length === 0) { return }

  if (vNodes.length === 1) {
    return mount(kit, vNodes[0], container, null)
  }

  const meta = getCurrentMeta()
  meta[CHILD_DIFFER] = createChildDiffer(kit, vNodes)

  for (let i = 0; i < vNodes.length; i++) {
    mount(kit, vNodes[i], container, null)
  }
}

function patchChildren(kit: RenderKit, lastChildren: VNode[], nextChildren: VNode[], container: Element): void {
  const meta = getCurrentMeta()

  if (lastChildren.length === 0) {
    delete meta[CHILD_DIFFER]
    return mountChildren(kit, nextChildren, container)
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

export function initProperties(kit: RenderKit, element: Element, props: Properties): void {
  if (Object.keys(props).length === 0) { return }

  const meta = getCurrentMeta()
  const differ = meta[PROP_DIFFER] = createPropDiffer(kit, {})
  const changes = differ.diff(props)

  if (!isNil(changes)) {
    const applyPropertyChange = createPropertyChangeCallback(kit, element)
    changes.forEachAddedItem(applyPropertyChange)
  }
}

export function patchProperties(kit: RenderKit, element: Element, props: Properties): void {
  const meta = getCurrentMeta()
  const differ = meta[PROP_DIFFER] = meta[PROP_DIFFER] || createPropDiffer(kit, {})
  const changes = differ.diff(props)

  if (!isNil(changes)) {
    const applyPropertyChange = createPropertyChangeCallback(kit, element)
    changes.forEachAddedItem(applyPropertyChange)
    changes.forEachChangedItem(applyPropertyChange)
    changes.forEachRemovedItem(applyPropertyChange)
  }
}

function setProperty(kit: RenderKit, element: Element, name: string, value: unknown) {
  if (name.length >= 3 && name[0] === 'o' && name[1] === 'n') {
    const firstChar = name[2]
    let eventName = name.substr(3)
    if (firstChar !== '_') {
      eventName = firstChar.toLowerCase() + eventName
    }
    setEventListener(kit, element, eventName, value as EventListener)
  } else if (name === 'className' && value == null) {
    const renderer = kit[RENDERER]
    renderer.setProperty(element, name, '')
  } else if (name === 'style') {
    setStyle(kit, element, value as Styles | string)
  } else {
    const renderer = kit[RENDERER]
    renderer.setProperty(element, name, value)
  }
}

function createPropertyChangeCallback(kit: RenderKit, element: Element) {
  return ({ key, currentValue }: KeyValueChangeRecord<string, unknown>) => setProperty(kit, element, key, currentValue)
}


function setStyle(kit: RenderKit, element: Element, styles: Styles | string): void {
  // TODO: Diff styles
  kit[RENDERER].setProperty(element, 'style', styles)
}


const EVENTS_KEY = '__ngv_events__'

interface EventHandlers {
  [name: string]: () => void
}

export function setEventListener(kit: RenderKit, element: Element, eventName: string, listener: EventListener): void {
  const events = getEventHandlers(kit, element)
  let disposer: (() => void) | null = null
  if ((disposer = events[eventName]) != null) {
    disposer()
  }
  events[eventName] = kit[RENDERER].listen(element, eventName, listener)
}

export function removeAllEventListeners(kit: RenderKit, element: Element): void {
  const events = getEventHandlers(kit, element)
  for (const eventName in events) {
    events[eventName]()
  }
}

function getEventHandlers(kit: RenderKit, element: Element): EventHandlers {
  const untypedElement = element as { [key: string]: unknown }
  if (!untypedElement[EVENTS_KEY]) {
    untypedElement[EVENTS_KEY] = Object.create(null)
  }
  return untypedElement[EVENTS_KEY] as EventHandlers
}
