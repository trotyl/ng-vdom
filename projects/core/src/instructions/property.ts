import { KeyValueChangeRecord } from '@angular/core'
import { isNil } from '../shared/lang'
import { RenderKit, RENDERER } from '../shared/render-kit'
import { Properties, PROP_DIFFER, Styles } from '../shared/types'
import { setEventListener } from './event'
import { getCurrentMeta } from './register'
import { createPropDiffer } from './util'

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
