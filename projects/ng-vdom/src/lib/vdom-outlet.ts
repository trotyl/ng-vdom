import { isDevMode, Component, ElementRef, Input, KeyValueDiffers, SimpleChanges, Renderer2, RendererFactory2, DoCheck, IterableDiffers } from '@angular/core'
import { ReactNode, ReactElement, DOMElement, ComponentElement, HTMLAttributes } from 'react'
import { mount } from './instructions/mount'
import { patch } from './instructions/patch'
import { init, getVNode } from './instructions/registry'

@Component({
  selector: 'vdom-outlet',
  template: ``,
})
export class VDomOutlet implements DoCheck {
  @Input() element: ReactElement<any> | null = null
  @Input() context: object = {}

  private renderer: Renderer2
  private node: Node | null = null

  constructor(
    rendererFactory: RendererFactory2,
    private elementRef: ElementRef,
    kDiffers: KeyValueDiffers,
    iDiffers: IterableDiffers,
  ) {
    this.renderer = rendererFactory.createRenderer(null, null)

    init(kDiffers, iDiffers)
  }

  ngDoCheck(): void {
    if (!this.node && this.element) {
      this.node = mount(this.element, this.elementRef.nativeElement, this.renderer)
    } else if (this.node && this.element !== getVNode(this.elementRef.nativeElement)) {
      this.node = patch(this.element, this.node, this.elementRef.nativeElement, this.renderer)
    }
  }
}
