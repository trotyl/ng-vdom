import { KeyValueDiffer } from '@angular/core'
import { getCurrentRenderer } from '../shared/context'
import { Events } from './registry'

export type EventHandler = (event: any) => void

export function patchEvent(prop: string, handler: EventHandler | null, host: Element, events: Events): void {
  const eventName = prop.slice(2).toLowerCase()

  if (eventName in events) {
    events[eventName]()
    delete events[eventName]
  }

  if (handler) {
    events[eventName] = getCurrentRenderer().listen(host, eventName, handler)
  }
}

export function patchStyle(styles: object, host: Element): void {
  // TODO: Diff styles
  getCurrentRenderer().setProperty(host, 'style', styles)
}

export function patchProp(prop: string, value: any, host: Element, events: Events): void {
  if (prop[0] === 'o' && prop[1] === 'n') {
    patchEvent(prop, value, host, events)
  } else if (prop === 'style') {
    patchStyle(value, host)
  } else {
    getCurrentRenderer().setProperty(host, prop, value)
  }
}

export function mountProps<P>(props: P, propDiffer: KeyValueDiffer<string, any>, host: Element, events: Events): void {
  const changes = propDiffer.diff(props)
  if (changes) {
    changes.forEachAddedItem(record => patchProp(record.key, record.currentValue, host, events))
  }
}
