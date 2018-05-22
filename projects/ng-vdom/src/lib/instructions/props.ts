import { Renderer2, KeyValueDiffers, KeyValueDiffer } from '@angular/core'
import { ReactNode, CSSProperties } from 'react'
import { renderer, getEvents, getProps } from './registry'

export function patchEvent(prop: string, handler: ((event: any) => void) | null, host: Element): void {
  const eventName = prop.slice(2).toLowerCase()

  const events = getEvents(host)
  if (eventName in events) {
    events[eventName]()
    delete events[eventName]
  }

  if (handler) {
    events[eventName] = renderer.listen(host, eventName, handler)
  }
}

export function patchStyle(styles: CSSProperties, host: Element): void {
  // TODO: Diff styles
  renderer.setProperty(host, 'style', styles)
}

export function patchProp(prop: string, value: any, host: Element): void {
  if (prop.startsWith('on')) {
    patchEvent(prop, value, host)
  } else if (prop === 'style') {
    patchStyle(value, host)
  } else {
    renderer.setProperty(host, prop, value)
  }
}

export function mountProps<P>(props: P, host: Element): void {
  const differ = getProps(host)

  const changes = differ.diff(props as any)
  if (changes) {
    changes.forEachAddedItem(record => renderer.setProperty(host, record.key, record.currentValue))
  }
}
