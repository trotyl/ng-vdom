import { KeyValueDiffers, IterableDiffers, Renderer2 } from '@angular/core'
import { Updater } from '../definitions/updater'
import { noopUpdater } from './noop'

let keyValueDiffers: KeyValueDiffers | null = null
let iterableDiffers: IterableDiffers | null = null
let renderer: Renderer2 | null = null
let updater: Updater = noopUpdater

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

export function setCurrentUpdater(newUpdater: Updater): Updater {
  const oldUpdater = updater
  updater = newUpdater
  return oldUpdater
}

export function getCurrentUpdater(): Updater {
  return updater
}
