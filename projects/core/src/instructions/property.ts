import { KeyValueChangeRecord } from '@angular/core'
import { getCurrentRenderer } from '../shared/context'
import { isNullOrUndefined } from '../shared/lang'
import { Properties, Styles } from '../shared/types'
import { getCurrentPropertyDiffer } from './register'

function patchStyle(element: Element, styles: Styles | string): void {
  // TODO: Diff styles
  getCurrentRenderer().setProperty(element, 'style', styles)
}

function setProperty(element: Element, name: string, value: any) {
  if (name[0] === 'o' && name[1] === 'n') {
    // TODO: add support for events
  } else if (name === 'style') {
    patchStyle(element, value as any)
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
