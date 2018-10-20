import { IterableDiffer, KeyValueDiffer } from '@angular/core'
import { isNullOrUndefined } from '../shared/lang'
import { VNode, VNodeMeta } from '../shared/types'

let currentMeta: VNodeMeta | null = null

export function setCurrentMeta(meta: VNodeMeta | null): VNodeMeta | null {
  const previous = currentMeta
  currentMeta = meta
  return previous
}

function notAvailable(item: string): never {
  throw new Error(`${item} not available`)
}

export function getCurrentPropertyDiffer(): KeyValueDiffer<string, any> {
  if (isNullOrUndefined(currentMeta) || isNullOrUndefined(currentMeta.$PD)) {
    return notAvailable('PropertyDiffer')
  }

  return currentMeta.$PD
}

export function getCurrentChildrenDiffer(): IterableDiffer<VNode> {
  if (isNullOrUndefined(currentMeta) || isNullOrUndefined(currentMeta.$CD)) {
    return notAvailable('ChildrenDiffer')
  }

  return currentMeta.$CD
}
