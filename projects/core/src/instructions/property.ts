import { KeyValueChangeRecord } from '@angular/core'
import { getCurrentRenderer } from '../shared/context'
import { isNullOrUndefined } from '../shared/lang'
import { Properties, Styles } from '../shared/types'
import { getCurrentPropertyDiffer } from './register'

export function initProperties(element: Element, props: Properties): void {
  const propertyDiffer = getCurrentPropertyDiffer()
  const changes = propertyDiffer.diff(props)

  if (!isNullOrUndefined(changes)) {
    const applyPropertyChange = createPropertyChangeCallback(element)
    changes.forEachAddedItem(applyPropertyChange)
  }
}

export function patchProperties(element: Element, props: Properties): void {
  const propertyDiffer = getCurrentPropertyDiffer()
  const changes = propertyDiffer.diff(props)

  if (!isNullOrUndefined(changes)) {
    const applyPropertyChange = createPropertyChangeCallback(element)
    changes.forEachAddedItem(applyPropertyChange)
    changes.forEachChangedItem(applyPropertyChange)
    changes.forEachRemovedItem(applyPropertyChange)
  }
}

function setProperty(element: Element, name: string, value: any) {
  if (name.length >= 3 && name[0] === 'o' && name[1] === 'n') {
    const firstChar = name[2]
    let eventName = name.substr(3)
    if (firstChar !== '_') {
      eventName = firstChar.toLowerCase() + eventName
    }
    setEventListener(element, eventName, value)
  } else if (name === 'style') {
    setStyle(element, value as any)
  } else {
    getCurrentRenderer().setProperty(element, name, value)

    if (isNullOrUndefined(value)) {
      getCurrentRenderer().removeAttribute(element, name)
    }
  }
}

function createPropertyChangeCallback(element: Element) {
  return ({ key, currentValue }: KeyValueChangeRecord<string, any>) => setProperty(element, key, currentValue)
}

const EVENTS_KEY = '__ngv_events__'

interface EventHandlers {
  [name: string]: Array<() => void>
}

function setEventListener(element: Element, eventName: string, listener: EventListener): void {
  const renderer = getCurrentRenderer()
  const disposer = renderer.listen(element, eventName, listener)

  const untypedElement = element as { [key: string]: any }
  if (!untypedElement.hasOwnProperty(EVENTS_KEY)) {
    untypedElement[EVENTS_KEY] = {}
  }
  const events = untypedElement[EVENTS_KEY] as EventHandlers
  if (!events.hasOwnProperty(eventName)) {
    events[eventName] = []
  }
  const disposers = events[eventName]
  disposers.push(disposer)
}

function setStyle(element: Element, styles: Styles | string): void {
  // TODO: Diff styles
  getCurrentRenderer().setProperty(element, 'style', styles)
}
