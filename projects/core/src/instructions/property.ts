import { KeyValueChangeRecord } from '@angular/core'
import { createPropertyDiffer, getCurrentRenderer } from '../shared/context'
import { isNil } from '../shared/lang'
import { Properties, PROP_DIFFER, Styles } from '../shared/types'
import { setEventListener } from './event'
import { getCurrentMeta } from './register'

export function initProperties(element: Element, props: Properties): void {
  if (Object.keys(props).length === 0) { return }

  const meta = getCurrentMeta()
  const differ = meta[PROP_DIFFER] = createPropertyDiffer({})
  const changes = differ.diff(props)

  if (!isNil(changes)) {
    const applyPropertyChange = createPropertyChangeCallback(element)
    changes.forEachAddedItem(applyPropertyChange)
  }
}

export function patchProperties(element: Element, props: Properties): void {
  const meta = getCurrentMeta()
  const differ = meta[PROP_DIFFER] = meta[PROP_DIFFER] || createPropertyDiffer({})
  const changes = differ.diff(props)

  if (!isNil(changes)) {
    const applyPropertyChange = createPropertyChangeCallback(element)
    changes.forEachAddedItem(applyPropertyChange)
    changes.forEachChangedItem(applyPropertyChange)
    changes.forEachRemovedItem(applyPropertyChange)
  }
}

function setProperty(element: Element, name: string, value: unknown) {
  if (name.length >= 3 && name[0] === 'o' && name[1] === 'n') {
    const firstChar = name[2]
    let eventName = name.substr(3)
    if (firstChar !== '_') {
      eventName = firstChar.toLowerCase() + eventName
    }
    setEventListener(element, eventName, value as EventListener)
  } else if (name === 'className' && value == null) {
    const renderer = getCurrentRenderer()
    renderer.setProperty(element, name, '')
  } else if (name === 'style') {
    setStyle(element, value as Styles | string)
  } else {
    const renderer = getCurrentRenderer()
    renderer.setProperty(element, name, value)
  }
}

function createPropertyChangeCallback(element: Element) {
  return ({ key, currentValue }: KeyValueChangeRecord<string, unknown>) => setProperty(element, key, currentValue)
}


function setStyle(element: Element, styles: Styles | string): void {
  // TODO: Diff styles
  getCurrentRenderer().setProperty(element, 'style', styles)
}
