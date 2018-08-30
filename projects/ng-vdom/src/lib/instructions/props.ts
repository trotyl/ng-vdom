import { KeyValueDiffer } from '@angular/core'
import { CSSProperties } from 'react'
import { getRenderer } from '../utils/context'
import { Events } from './registry'

export type EventHandler = (event: any) => void

export function patchEvent(prop: string, handler: EventHandler | null, host: Element, events: Events): void {
  const eventName = prop.slice(2).toLowerCase()

  if (eventName in events) {
    events[eventName]()
    delete events[eventName]
  }

  if (handler) {
    events[eventName] = getRenderer().listen(host, eventName, handler)
  }
}

export function patchStyle(styles: CSSProperties, host: Element): void {
  // TODO: Diff styles
  getRenderer().setProperty(host, 'style', styles)
}

export function patchProp(prop: string, value: any, host: Element, events: Events): void {
  if (prop.startsWith('on')) {
    patchEvent(prop, value, host, events)
  } else if (prop === 'style') {
    patchStyle(value, host)
  } else {
    getRenderer().setProperty(host, prop, value)
  }
}

export function mountProps<P>(props: P, propDiffer: KeyValueDiffer<string, any>, host: Element, events: Events): void {
  const changes = propDiffer.diff(props)
  if (changes) {
    changes.forEachAddedItem(record => patchProp(record.key, record.currentValue, host, events))
  }
}
