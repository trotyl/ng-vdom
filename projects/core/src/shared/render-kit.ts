import { ApplicationRef, ComponentFactoryResolver, Injector, IterableDiffers, KeyValueDiffers, Renderer2 } from '@angular/core'
import { UpdateQueue } from './update-queue'

export const APPLICATION_REF = 0
export const COMPONENT_FACTORY_RESOLVER = 1
export const INJECTOR = 2
export const ITERABLE_DIFFERS = 3
export const KEY_VALUE_DIFFERS = 4
export const LIFE_CYCLE_HOOKS = 5
export const RENDERER = 6
export const UPDATE_QUEUE = 7

export interface RenderKit extends Array<unknown> {
  [APPLICATION_REF]: ApplicationRef
  [COMPONENT_FACTORY_RESOLVER]: ComponentFactoryResolver
  [INJECTOR]: Injector
  [ITERABLE_DIFFERS]: IterableDiffers
  [KEY_VALUE_DIFFERS]: KeyValueDiffers
  [LIFE_CYCLE_HOOKS]: Array<() => void>
  [RENDERER]: Renderer2
  [UPDATE_QUEUE]: UpdateQueue
}

export function createRenderKit(
  app: ApplicationRef,
  cfr: ComponentFactoryResolver,
  injector: Injector,
  iDiffers: IterableDiffers,
  kDiffers: KeyValueDiffers,
  hooks: Array<() => void>,
  renderer: Renderer2,
  queue: UpdateQueue,
): RenderKit {
  return [app, cfr, injector, iDiffers, kDiffers, hooks, renderer, queue]
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
