import { KeyValueDiffers, IterableDiffers, Renderer2 } from '@angular/core'
import { Updater } from '../definitions/updater'
import { noopUpdater } from './noop'

export let keyValueDiffers: KeyValueDiffers | null = null
export let iterableDiffers: IterableDiffers | null = null
export let renderer: Renderer2 | null = null
export let updater: Updater = noopUpdater

export function init(kDiffers: KeyValueDiffers, iDiffers: IterableDiffers, r: Renderer2): void {
  keyValueDiffers = kDiffers
  iterableDiffers = iDiffers
  renderer = r
}

export function getRenderer(): Renderer2 {
  return renderer!
}

export function setCurrentUpdater(newUpdater: Updater): Updater {
  const oldUpdater = updater
  updater = newUpdater
  return oldUpdater
}
