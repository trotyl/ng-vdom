import { Component, DoCheck, ElementRef, Input, IterableDiffers, KeyValueDiffers, RendererFactory2 } from '@angular/core'
import { setCurrentIterableDiffers, setCurrentKeyValueDiffers, setCurrentRenderer, setCurrentUpdateQueue } from './entities/context'
import { isFunction } from './entities/lang'
import { Component as VComponent, VNode } from './entities/types'
import { UpdateQueue } from './entities/update-queue'
import { mount } from './instructions/mount'
import { patch } from './instructions/patch'

@Component({
  selector: 'v-outlet',
  template: ``,
})
export class VDomOutlet implements DoCheck, UpdateQueue {
  @Input() element: VNode | null = null
  @Input() context: object = {}

  private node: Node | null = null
  private lastElement: VNode | null = null
  private queue: Function[] = []
  private pendingSchedule: number | null = null

  constructor(
    rendererFactory: RendererFactory2,
    private elementRef: ElementRef,
    kDiffers: KeyValueDiffers,
    iDiffers: IterableDiffers,
  ) {
    setCurrentIterableDiffers(iDiffers)
    setCurrentKeyValueDiffers(kDiffers)
    setCurrentRenderer(rendererFactory.createRenderer(null, null))
  }

  ngDoCheck(): void {
    if (!this.node && this.element) {
      this.tick(true)
      this.lastElement = this.element
    } else if (this.node && this.element !== this.lastElement) {
      this.tick()
      this.lastElement = this.element
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

    if (this.pendingSchedule == null) {
      this.pendingSchedule = requestAnimationFrame(() => {

        for (let i = 0; i < this.queue.length; i++) {
          this.queue[i]()
        }
        this.queue = []
        this.pendingSchedule = null

        this.tick()
      })
    }
  }

  private tick(mountMode: boolean = false): void {
    const previousUpdateQueue = setCurrentUpdateQueue(this)

    const lifecycle: Function[] = []

    if (mountMode) {
      this.node = mount(this.element!, this.elementRef.nativeElement, lifecycle)
    } else {
      this.node = patch(this.lastElement!, this.element!, this.node!, this.elementRef.nativeElement, lifecycle)
    }

    for (let i = 0; i < lifecycle.length; i++) {
      lifecycle[i]()
    }

    setCurrentUpdateQueue(previousUpdateQueue)
  }
}
