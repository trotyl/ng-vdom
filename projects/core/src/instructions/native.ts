
import { KeyValueChangeRecord } from '@angular/core'
import { createEmptyMeta } from '../shared/node'
import { RenderKit, RENDERER } from '../shared/render-kit'
import { CHILD_DIFFER, Properties, PROP_DIFFER, Styles, STYLE_DIFFER, VNode } from '../shared/types'
import { mountArray, patchArray } from './array'
import { mount } from './mount'
import { appendChild, createElement, insertBefore } from './render'
import { createChildDiffer, createPropDiffer, createStyleDiffer, isEventLikeProp, parseEventName } from './util'

export function mountNative(kit: RenderKit, vNode: VNode, container: Element | null, nextNode: Node | null): void {
  vNode.meta = createEmptyMeta()

  const type = vNode.type as string
  const props = vNode.props as Properties | null
  const children = vNode.children!

  const element = vNode.native = createElement(kit, type)

  if (props != null) {
    patchProperties(kit, vNode, props)
  }

  mountChildren(kit, vNode, children)

  if (container != null) {
    insertBefore(kit, container, element, nextNode)
  }
}

export function patchNative(kit: RenderKit, lastVNode: VNode, nextVNode: VNode): void {
  nextVNode.meta = lastVNode.meta!

  const lastChildren = lastVNode.children!
  const lastProps = lastVNode.props
  const nextChildren = nextVNode.children!
  const nextProps = nextVNode.props as Properties

  nextVNode.native = lastVNode.native! as Element

  if (lastProps !== nextProps) {
    patchProperties(kit, nextVNode, nextProps)
  }
  if (lastChildren !== nextChildren) {
    patchChildren(kit, nextVNode, lastChildren, nextChildren)
  }
}

export function unmountNative(_kit: RenderKit, vNode: VNode): void {
  removeAllEventListeners(vNode.native as Element)
}

function mountChildren(kit: RenderKit, parent: VNode, vNodes: VNode[]): void {
  if (vNodes.length === 0) { return }

  const container = parent.native! as Element

  if (vNodes.length === 1) {
    const vNode = vNodes[0]
    return mount(kit, vNode, container, null)
  }

  const meta = parent.meta!
  meta[CHILD_DIFFER] = createChildDiffer(kit, vNodes)

  const childNodes = mountArray(kit, vNodes)
  for (let i = 0; i < childNodes.length; i++) {
    appendChild(kit, container, childNodes[i])
  }
}

function patchChildren(kit: RenderKit, parent: VNode, lastChildren: VNode[], nextChildren: VNode[]): void {
  const meta = parent.meta!
  const container = parent.native! as Element
  let differ = meta[CHILD_DIFFER]
  if (differ == null) {
    differ = meta[CHILD_DIFFER] = createChildDiffer(kit, lastChildren)
  }

  patchArray(kit, differ, lastChildren, nextChildren, container)
}

function patchProperties(kit: RenderKit, vNode: VNode, props: Properties): void {
  const meta = vNode.meta!
  let differ = meta[PROP_DIFFER]

  if (differ == null) {
    if (Object.keys(props).length === 0) { return }
    differ = meta[PROP_DIFFER] = createPropDiffer(kit)
  }
  const changes = differ.diff(props)

  if (changes != null) {
    const applyPropertyChange = createPropertyChangeCallback(kit, vNode)
    changes.forEachAddedItem(applyPropertyChange)
    changes.forEachChangedItem(applyPropertyChange)
    changes.forEachRemovedItem(applyPropertyChange)
  }
}

function setProperty(kit: RenderKit, vNode: VNode, prop: string, value: unknown) {
  const element = vNode.native! as Element

  if (isEventLikeProp(prop)) {
    const eventName = parseEventName(prop)
    setEventListener(kit, element, eventName, value as EventListener)
  } else if (prop === 'className' && value == null) {
    const renderer = kit[RENDERER]
    renderer.setProperty(element, prop, '')
  } else if (prop === 'style') {
    setStyle(kit, vNode, value as Styles)
  } else {
    const renderer = kit[RENDERER]
    renderer.setProperty(element, prop, value)
  }
}

function createPropertyChangeCallback(kit: RenderKit, vNode: VNode) {
  return ({ key, currentValue }: KeyValueChangeRecord<string, unknown>) => setProperty(kit, vNode, key, currentValue)
}


function setStyle(kit: RenderKit, vNode: VNode, styles: Styles): void {
  const element = vNode.native! as Element
  const renderer = kit[RENDERER]

  const meta = vNode.meta!
  let differ = meta[STYLE_DIFFER]
  if (differ == null) {
    differ = meta[STYLE_DIFFER] = createStyleDiffer(kit)
  }
  const changes = differ.diff(styles)

  if (changes != null) {
    changes.forEachAddedItem(record => renderer.setStyle(element, record.key, record.currentValue))
    changes.forEachChangedItem(record => renderer.setStyle(element, record.key, record.currentValue))
    changes.forEachRemovedItem(record => renderer.removeStyle(element, record.key))
  }
}


const EVENTS_KEY = '__niro_events__'

interface EventHandlers {
  [name: string]: () => void
}

function setEventListener(kit: RenderKit, element: Element, eventName: string, listener: EventListener): void {
  const events = getEventHandlers(element)
  const disposer: (() => void) | undefined = events[eventName]
  if (disposer != null) {
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
