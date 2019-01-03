import { ComponentFactoryResolver, Injector, IterableDiffers, KeyValueDiffers, Renderer2 } from '@angular/core'
import { UpdateQueue } from './update-queue'

export const COMPONENT_FACTORY_RESOLVER = 0
export const INJECTOR = 1
export const ITERABLE_DIFFERS = 2
export const KEY_VALUE_DIFFERS = 3
export const RENDERER = 4
export const UPDATE_QUEUE = 5

export interface RenderKit extends Array<unknown> {
  [COMPONENT_FACTORY_RESOLVER]: ComponentFactoryResolver
  [INJECTOR]: Injector
  [ITERABLE_DIFFERS]: IterableDiffers
  [KEY_VALUE_DIFFERS]: KeyValueDiffers
  [RENDERER]: Renderer2
  [UPDATE_QUEUE]: UpdateQueue
}

export function createRenderKit(
  cfr: ComponentFactoryResolver,
  injector: Injector,
  iDiffers: IterableDiffers,
  kDiffers: KeyValueDiffers,
  renderer: Renderer2,
  queue: UpdateQueue,
): RenderKit {
  return [cfr, injector, iDiffers, kDiffers, renderer, queue]
}

let currentRenderKit: RenderKit | null = null

export function setCurrentRenderKit(renderKit: RenderKit | null): RenderKit | null {
  const previous = currentRenderKit
  currentRenderKit = renderKit
  return previous
}

export function getCurrentRenderKit(): RenderKit | null {
  return currentRenderKit
}
