import { IterableDiffers, KeyValueDiffers, Renderer2 } from '@angular/core'
import { UpdateQueue } from './update-queue'

let keyValueDiffers: KeyValueDiffers | null = null
let iterableDiffers: IterableDiffers | null = null
let renderer: Renderer2 | null = null
let updateQueue: UpdateQueue | null = null

export function setCurrentKeyValueDiffers(differs: KeyValueDiffers | null): KeyValueDiffers | null {
  const previous = keyValueDiffers
  keyValueDiffers = differs
  return previous
}

export function getCurrentKeyValueDiffers(): KeyValueDiffers {
  if (keyValueDiffers == null) {
    throw new Error(`KeyValueDiffers not available!`)
  }
  return keyValueDiffers
}

export function setCurrentIterableDiffers(differs: IterableDiffers | null): IterableDiffers | null {
  const previous = iterableDiffers
  iterableDiffers = differs
  return previous
}

export function getCurrentIterableDiffers(): IterableDiffers {
  if (iterableDiffers == null) {
    throw new Error(`IterableDiffers not available!`)
  }
  return iterableDiffers
}

export function setCurrentRenderer(r: Renderer2 | null): Renderer2 | null {
  const previous = renderer
  renderer = r
  return previous
}

export function getCurrentRenderer(): Renderer2 {
  if (renderer == null) {
    throw new Error(`Renderer not available!`)
  }
  return renderer
}

export function setCurrentUpdateQueue(queue: UpdateQueue | null): UpdateQueue | null {
  const previous = updateQueue
  updateQueue = queue
  return previous
}

export function getCurrentUpdateQueue(): UpdateQueue {
  if (updateQueue == null) {
    throw new Error(`UpdateQueue not available!`)
  }
  return updateQueue
}
