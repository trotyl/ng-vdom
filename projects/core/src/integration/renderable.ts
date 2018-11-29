import { DoCheck, ElementRef, Injectable, Injector, Renderer2, RendererFactory2, Type } from '@angular/core'
import { setCurrentInjector, setCurrentRenderer } from '../shared/context'
import { NodeDef } from '../shared/types'
import { Container } from './container'

@Injectable()
export abstract class Renderable extends Container implements DoCheck {
  protected __injector: Injector
  protected __renderer: Renderer2

  constructor(injector: Injector) {
    super()

    this.__injector = injector
    this.__container = (injector.get(ElementRef as Type<ElementRef>)).nativeElement

    const renderer = injector.get(Renderer2 as Type<Renderer2>, null!) as Renderer2 | null
    this.__renderer = renderer || (injector.get(RendererFactory2 as Type<RendererFactory2>)).createRenderer(null, null)
  }

  abstract render(): NodeDef | null

  ngDoCheck(): void {
    this.__def = this.render()

    this.__detectChanges()
  }

  protected __switchContext(): () => void {
    const previousInjector = setCurrentInjector(this.__injector)
    const previousRenderer = setCurrentRenderer(this.__renderer)

    return () => {
      setCurrentInjector(previousInjector)
      setCurrentRenderer(previousRenderer)
    }
  }
}
