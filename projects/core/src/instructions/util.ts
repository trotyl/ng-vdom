import { IterableDiffer, KeyValueDiffer } from '@angular/core'
import { ITERABLE_DIFFERS, KEY_VALUE_DIFFERS, RenderKit } from '../shared/render-kit'
import { trackByKey } from '../shared/track'
import { Properties, VNode } from '../shared/types'

export function createPropDiffer(kit: RenderKit, props: Properties): KeyValueDiffer<string, unknown> {
  const differ = kit[KEY_VALUE_DIFFERS].find(props).create<string, unknown>()
  differ.diff(props)
  return differ
}

export function createChildDiffer(kit: RenderKit, children: VNode[]): IterableDiffer<VNode> {
  const differ = kit[ITERABLE_DIFFERS].find(children).create(trackByKey)
  differ.diff(children)
  return differ
}
