import { isDevMode, Component, ElementRef, Input, KeyValueDiffers, SimpleChanges, Renderer2, RendererFactory2, DoCheck, IterableDiffers } from '@angular/core'
import { ReactNode, ReactElement, DOMElement, ComponentElement, HTMLAttributes } from 'react'
import { mount } from './instructions/mount'
import { patch } from './instructions/patch'
import { init } from './utils/context'

@Component({
  selector: 'vdom-outlet',
  template: ``,
})
export class VDomOutlet implements DoCheck {
  @Input() element: ReactElement<any> | null = null
  @Input() context: object = {}

  private node: Node | null = null
  private lastElement: ReactElement<any> | null = null

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
      this.node = mount(this.element, this.elementRef.nativeElement)
      this.lastElement = this.element
    } else if (this.node && this.element !== this.lastElement) {
      this.node = patch(this.lastElement, this.element, this.node, this.elementRef.nativeElement)
      this.lastElement = this.element
    }
  }
}
