import { Renderer2, KeyValueDiffers, KeyValueDiffer } from '@angular/core'
import { ReactNode, CSSProperties } from 'react'
import { getEvents, getProps } from './registry'

export function patchEvent(prop: string, handler: ((event: any) => void) | null, host: Element, renderer: Renderer2): void {
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

export function patchStyle(styles: CSSProperties, host: Element, renderer: Renderer2): void {
  // TODO: Diff styles
  renderer.setProperty(host, 'style', styles)
}

export function patchProp(prop: string, value: any, host: Element, renderer: Renderer2): void {
  if (prop.startsWith('on')) {
    patchEvent(prop, value, host, renderer)
  } else if (prop === 'style') {
    patchStyle(value, host, renderer)
  } else {
    renderer.setProperty(host, prop, value)
  }
}

export function mountProps<P>(props: P, host: Element, renderer: Renderer2): void {
  const differ = getProps(host)

  const changes = differ.diff(props as any)
  if (changes) {
    changes.forEachAddedItem(record => renderer.setProperty(host, record.key, record.currentValue))
  }
}
