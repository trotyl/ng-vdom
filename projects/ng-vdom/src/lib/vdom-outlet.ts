import { isDevMode, Component, ElementRef, Input, SimpleChanges, Renderer2, RendererFactory2, DoCheck } from '@angular/core'
import { ReactNode, ReactElement, DOMElement, ComponentElement, HTMLAttributes } from 'react'
import { mount } from './instructions/mount'

@Component({
  selector: 'vdom-outlet',
  template: ``,
})
export class VDomOutlet implements DoCheck {
  @Input() element: ReactElement<any> | null = null
  @Input() context: object = {}

  private renderer: Renderer2
  private mounted = false

  constructor(
    rendererFactory: RendererFactory2,
    private elementRef: ElementRef,
  ) {
    this.renderer = rendererFactory.createRenderer(null, null)
  }

  ngDoCheck(): void {
    if (!this.mounted && this.element) {
      mount(this.element, this.elementRef.nativeElement, this.renderer)
      this.mounted = true
    }
  }
}
