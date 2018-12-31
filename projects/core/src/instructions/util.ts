import { IterableDiffer, KeyValueDiffer } from '@angular/core'
import { EMPTY_ARRAY, EMPTY_OBJ } from '../shared/lang'
import { ITERABLE_DIFFERS, KEY_VALUE_DIFFERS, RenderKit } from '../shared/render-kit'
import { trackByKey } from '../shared/track'
import { Properties, Styles, VNode } from '../shared/types'

export function createPropDiffer(kit: RenderKit, props: Properties = EMPTY_OBJ): KeyValueDiffer<string, unknown> {
  const differ = kit[KEY_VALUE_DIFFERS].find(EMPTY_OBJ).create<string, unknown>()
  differ.diff(props)
  return differ
}

export function createChildDiffer(kit: RenderKit, children: VNode[] = EMPTY_ARRAY): IterableDiffer<VNode> {
  const differ = kit[ITERABLE_DIFFERS].find(children).create(trackByKey)
  differ.diff(children)
  return differ
}

export function createStyleDiffer(kit: RenderKit, styles: Styles = EMPTY_OBJ): KeyValueDiffer<string, string> {
  const differ = kit[KEY_VALUE_DIFFERS].find(EMPTY_OBJ).create<string, string>()
  differ.diff(styles)
  return differ
}

export function isEventLikeProp(prop: string): boolean {
  return prop.length >= 3 && prop[0] === 'o' && prop[1] === 'n'
}

export function parseEventName(prop: string): string {
  const firstChar = prop[2]
  let eventName = prop.substr(3)
  if (firstChar !== '_') {
    eventName = firstChar.toLowerCase() + eventName
  }
  return eventName
}
