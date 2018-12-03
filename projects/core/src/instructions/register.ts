import { isNil } from '../shared/lang'
import { VNodeMeta } from '../shared/types'

let currentMeta: VNodeMeta | null = null

export function setCurrentMeta(meta: VNodeMeta | null): VNodeMeta | null {
  const previous = currentMeta
  currentMeta = meta
  return previous
}

export function getCurrentMeta(): VNodeMeta {
  if (isNil(currentMeta)) {
    return notAvailable('VNodeMeta')
  }

  return currentMeta
}

function notAvailable(item: string): never {
  throw new Error(`${item} not available`)
}
