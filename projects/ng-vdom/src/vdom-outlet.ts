import { Component, DoCheck, ElementRef, Inject, InjectionToken, Input, IterableDiffers, KeyValueDiffers, RendererFactory2 } from '@angular/core'
import { mount } from './instructions/mount'
import { patch } from './instructions/patch'
import { setChildNodes } from './instructions/registry'
import { Component as VComponent } from './shared/component'
import { setCurrentIterableDiffers, setCurrentKeyValueDiffers, setCurrentRenderer, setCurrentUpdateQueue } from './shared/context'
import { isFunction } from './shared/lang'
import { VNode } from './shared/node'
import { UpdateQueue } from './shared/update-queue'

export type TaskScheduler = (fn: () => void) => void

export function requestAnimationFrameSchedulerFactory(): TaskScheduler {
  return requestAnimationFrame
}

export const TASK_SCHEDULER = new InjectionToken<TaskScheduler>('TaskScheduler', {
  providedIn: 'root',
  factory: requestAnimationFrameSchedulerFactory,
})

@Component({
  selector: 'v-outlet',
  template: ``,
})
export class VDomOutlet implements DoCheck, UpdateQueue {
  @Input() def: VNode | null = null
  @Input() context: object = {}

  private node: Node | null = null
  // TODO: rename property to `previousDef`
  private lastElement: VNode | null = null
  private queue: Function[] = []
  private pendingSchedule = false

  constructor(
    rendererFactory: RendererFactory2,
    private elementRef: ElementRef,
    kDiffers: KeyValueDiffers,
    iDiffers: IterableDiffers,
    @Inject(TASK_SCHEDULER) private scheduler: any,
  ) {
    setCurrentIterableDiffers(iDiffers)
    setCurrentKeyValueDiffers(kDiffers)
    setCurrentRenderer(rendererFactory.createRenderer(null, null))
  }

  ngDoCheck(): void {
    if (!this.node && this.def) {
      this.tick(true)
      this.lastElement = this.def
    } else if (this.node && this.def !== this.lastElement) {
      this.tick()
      this.lastElement = this.def
    }
  }

  enqueueForceUpdate(publicInstance: object, callback?: (() => void) | undefined, callerName?: string | undefined): void {
    throw new Error('Not implemented!')
  }

  enqueueSetState<S>(instance: VComponent, partialState: S, callback?: (() => void) | undefined): void {
    this.queue.push(() => {
      if (isFunction(partialState)) {
        partialState = partialState(instance.state)
      }
      Object.assign(instance.state, partialState)
    })

    if (!this.pendingSchedule) {
      this.pendingSchedule = true
      this.scheduler(() => {
        for (let i = 0; i < this.queue.length; i++) {
          this.queue[i]()
        }
        this.queue = []
        this.pendingSchedule = false

        this.tick()
      })
    }
  }

  private tick(mountMode: boolean = false): void {
    const previousUpdateQueue = setCurrentUpdateQueue(this)

    const lifecycle: Function[] = []

    if (mountMode) {
      this.node = mount(this.def!, this.elementRef.nativeElement, lifecycle)
    } else {
      this.node = patch(this.lastElement!, this.def!, this.node!, this.elementRef.nativeElement, lifecycle)
    }
    setChildNodes(this.elementRef.nativeElement, [this.node])

    for (let i = 0; i < lifecycle.length; i++) {
      lifecycle[i]()
    }

    setCurrentUpdateQueue(previousUpdateQueue)
  }
}
