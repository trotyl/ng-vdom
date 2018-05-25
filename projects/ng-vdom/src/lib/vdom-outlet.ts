import { isDevMode, Component, ElementRef, Input, KeyValueDiffers, SimpleChanges, Renderer2, RendererFactory2, DoCheck, IterableDiffers } from '@angular/core'
import { ReactNode, ReactElement, DOMElement, ComponentElement, HTMLAttributes } from 'react'
import { Updater } from './definitions/updater'
import { init, setCurrentUpdater } from './utils/context'
import { isFunction } from './utils/lang'
import { mount } from './instructions/mount'
import { patch } from './instructions/patch'

@Component({
  selector: 'v-outlet',
  template: ``,
})
export class VDomOutlet implements DoCheck, Updater {
  @Input() element: ReactElement<any> | null = null
  @Input() context: object = {}

  private node: Node | null = null
  private lastElement: ReactElement<any> | null = null
  private queue: Function[] = []
  private pendingSchedule: number | null = null

  constructor(
    rendererFactory: RendererFactory2,
    private elementRef: ElementRef,
    kDiffers: KeyValueDiffers,
    iDiffers: IterableDiffers,
  ) {
    init(kDiffers, iDiffers, rendererFactory.createRenderer(null, null))
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

  enqueueSetState<S>(instance: React.Component<any, S, any>, partialState: S, callback?: (() => void) | undefined): void {
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
    const previousUpdater = setCurrentUpdater(this)

    const lifecycle: Function[] = []

    if (mountMode) {
      this.node = mount(this.element, this.elementRef.nativeElement, lifecycle)
    } else {
      this.node = patch(this.lastElement, this.element, this.node!, this.elementRef.nativeElement, lifecycle)
    }

    for (let i = 0; i < lifecycle.length; i++) {
      lifecycle[i]()
    }

    setCurrentUpdater(previousUpdater)
  }
}
