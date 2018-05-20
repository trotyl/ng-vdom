import { Renderer2 } from '@angular/core'
import { ReactNode, CSSProperties } from 'react'

const eventsRegistry = new WeakMap<Element, { [name: string]: () => void }>()

export function patchEvent(prop: string, handler: ((event: any) => void) | null, host: Element, renderer: Renderer2): void {
  const eventName = prop.substr(2).toLowerCase()

  if (!eventsRegistry.has(host)) {
    eventsRegistry.set(host, {})
  }

  const events = eventsRegistry.get(host)!
  if (eventName in events) {
    const dispose = events[eventName]
    dispose()
  }

  if (handler) {
    const dispose = renderer.listen(host, eventName, handler)
    events[eventName] = dispose
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

export function mountProps(props: { [prop: string]: any }, host: Element, renderer: Renderer2): void {
  for (const prop of Object.keys(props)) {
    patchProp(prop, props[prop], host, renderer)
  }
}
