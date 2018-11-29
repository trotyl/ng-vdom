import { ApplicationRef, ComponentFactoryResolver, Injector, IterableDiffer, IterableDiffers, KeyValueDiffer, KeyValueDiffers, Renderer2, Type } from '@angular/core'
import { notAvailableError } from './error'
import { TaskScheduler } from './schedule'
import { trackByKey } from './track'
import { Properties, VNode } from './types'
import { UpdateQueue } from './update-queue'

let currentInjector: Injector | null = null
let currentRenderer: Renderer2 | null = null
let updateQueue: UpdateQueue | null = null
let lifeCycles: Array<() => void> = []

export function setCurrentInjector(injector: Injector | null): Injector | null {
  const previous = currentInjector
  currentInjector = injector
  return previous
}

export function getCurrentInjector(): Injector {
  assertInjectorExists()
  return currentInjector!
}

export function getCurrentApplicationRef(): ApplicationRef {
  assertInjectorExists()
  return currentInjector!.get(ApplicationRef as Type<ApplicationRef>)
}

export function getCurrentKeyValueDiffers(): KeyValueDiffers {
  assertInjectorExists()
  return currentInjector!.get(KeyValueDiffers as Type<KeyValueDiffers>)
}

export function getCurrentIterableDiffers(): IterableDiffers {
  assertInjectorExists()
  return currentInjector!.get(IterableDiffers as Type<IterableDiffers>)
}

export function getCurrentComponentFactoryResolver(): ComponentFactoryResolver {
  assertInjectorExists()
  return currentInjector!.get(ComponentFactoryResolver as unknown as Type<ComponentFactoryResolver>)
}

export function setCurrentRenderer(renderer: Renderer2 | null): Renderer2 | null {
  const previous = currentRenderer
  currentRenderer = renderer
  return previous
}

export function getCurrentRenderer(): Renderer2 {
  if (currentRenderer == null) {
    return notAvailableError('Renderer')
  }
  return currentRenderer
}

export function setCurrentUpdateQueue(queue: UpdateQueue | null): UpdateQueue | null {
  const previous = updateQueue
  updateQueue = queue
  return previous
}

export function getCurrentUpdateQueue(): UpdateQueue {
  if (updateQueue == null) {
    return notAvailableError('UpdateQueue')
  }
  return updateQueue
}

export function queueLifeCycle(fn: () => void): void {
  lifeCycles.push(fn)
}

export function runLifeCycle(): void {
  for (const lifeCycle of lifeCycles) {
    lifeCycle()
  }
}

export function resetLifeCycle(): void {
  lifeCycles = []
}

let currentScheduler: TaskScheduler = requestAnimationFrame

export function setCurrentScheduler(scheduler: TaskScheduler): TaskScheduler {
  const previous = currentScheduler
  currentScheduler = scheduler
  return previous
}

export function getCurrentScheduler(): TaskScheduler {
  return currentScheduler
}

export function createPropertyDiffer(props: Properties): KeyValueDiffer<string, unknown> {
  const differ = getCurrentKeyValueDiffers().find(props).create<string, unknown>()
  differ.diff(props)
  return differ
}

export function createChildrenDiffer(children: VNode[]): IterableDiffer<VNode> {
  const differ = getCurrentIterableDiffers().find(children).create(trackByKey)
  differ.diff(children)
  return differ
}

function assertInjectorExists() {
  if (currentInjector == null) {
    return notAvailableError('Injector')
  }
}
