import { KeyValueDiffers, IterableDiffers, Renderer2 } from '@angular/core'

export let keyValueDiffers: KeyValueDiffers | null = null
export let iterableDiffers: IterableDiffers | null = null
export let renderer: Renderer2 | null = null

export function init(kDiffers: KeyValueDiffers, iDiffers: IterableDiffers, r: Renderer2): void {
  keyValueDiffers = kDiffers
  iterableDiffers = iDiffers
  renderer = r
}

export function getRenderer(): Renderer2 {
  return renderer!
}
