import { IterableDiffer, IterableDiffers, KeyValueDiffer, KeyValueDiffers, Renderer2 } from '@angular/core'
import { notAvailableError } from './error'
import { TaskScheduler } from './schedule'
import { trackByKey } from './track'
import { VNode } from './types'
import { UpdateQueue } from './update-queue'

let keyValueDiffers: KeyValueDiffers | null = null
let iterableDiffers: IterableDiffers | null = null
let renderer: Renderer2 | null = null
let updateQueue: UpdateQueue | null = null
let lifeCycles: Array<() => void> = []

export function setCurrentKeyValueDiffers(differs: KeyValueDiffers | null): KeyValueDiffers | null {
  const previous = keyValueDiffers
  keyValueDiffers = differs
  return previous
}

export function getCurrentKeyValueDiffers(): KeyValueDiffers {
  if (keyValueDiffers == null) {
    return notAvailableError('KeyValueDiffers')
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
    return notAvailableError('IterableDiffers')
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
    return notAvailableError('Renderer')
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

export function createPropertyDiffer(): KeyValueDiffer<string, unknown> {
  return getCurrentKeyValueDiffers().find({}).create()
}

export function createChildrenDiffer(): IterableDiffer<VNode> {
  return getCurrentIterableDiffers().find([]).create(trackByKey)
}
