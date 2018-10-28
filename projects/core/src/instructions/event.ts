import { getCurrentRenderer } from '../shared/context'

const EVENTS_KEY = '__ngv_events__'

interface EventHandlers {
  [name: string]: () => void
}

export function setEventListener(element: Element, eventName: string, listener: EventListener): void {
  const events = getEventHandlers(element)
  let disposer: (() => void) | null = null
  if ((disposer = events[eventName]) != null) {
    disposer()
  }
  events[eventName] = getCurrentRenderer().listen(element, eventName, listener)
}

export function removeAllEventListeners(element: Element): void {
  const events = getEventHandlers(element)
  for (const eventName in events) {
    events[eventName]()
  }
}

function getEventHandlers(element: Element): EventHandlers {
  const untypedElement = element as { [key: string]: unknown }
  if (!untypedElement[EVENTS_KEY]) {
    untypedElement[EVENTS_KEY] = Object.create(null)
  }
  return untypedElement[EVENTS_KEY] as EventHandlers
}
