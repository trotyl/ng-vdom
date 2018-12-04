import { RenderKit, RENDERER } from '../shared/render-kit'

const EVENTS_KEY = '__ngv_events__'

interface EventHandlers {
  [name: string]: () => void
}

export function setEventListener(kit: RenderKit, element: Element, eventName: string, listener: EventListener): void {
  const events = getEventHandlers(kit, element)
  let disposer: (() => void) | null = null
  if ((disposer = events[eventName]) != null) {
    disposer()
  }
  events[eventName] = kit[RENDERER].listen(element, eventName, listener)
}

export function removeAllEventListeners(kit: RenderKit, element: Element): void {
  const events = getEventHandlers(kit, element)
  for (const eventName in events) {
    events[eventName]()
  }
}

function getEventHandlers(kit: RenderKit, element: Element): EventHandlers {
  const untypedElement = element as { [key: string]: unknown }
  if (!untypedElement[EVENTS_KEY]) {
    untypedElement[EVENTS_KEY] = Object.create(null)
  }
  return untypedElement[EVENTS_KEY] as EventHandlers
}
