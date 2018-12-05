import { ComponentFactoryResolver, DoCheck, ElementRef, Injectable, Injector, IterableDiffers, KeyValueDiffers, Renderer2, RendererFactory2, Type } from '@angular/core'
import { LifecycleHooks } from '../shared/lifecycle'
import { createRenderKit, RenderKit } from '../shared/render-kit'
import { TaskScheduler } from '../shared/schedule'
import { NodeDef } from '../shared/types'
import { Container } from './container'

@Injectable()
export abstract class Renderable extends Container implements DoCheck {
  protected __cfr: ComponentFactoryResolver
  protected __injector: Injector
  protected __iDiffers: IterableDiffers
  protected __kDiffers: KeyValueDiffers
  protected __renderer: Renderer2
  protected __scheduler: TaskScheduler

  protected __def: NodeDef | null = null
  protected __container: Element
  protected __hooks!: LifecycleHooks

  constructor(injector: Injector) {
    super()

    this.__injector = injector
    this.__cfr = injector.get(ComponentFactoryResolver as unknown as Type<ComponentFactoryResolver>)
    this.__iDiffers = injector.get(IterableDiffers as Type<IterableDiffers>)
    this.__kDiffers = injector.get(KeyValueDiffers as Type<KeyValueDiffers>)

    // TODO: make schduler a DI token
    this.__scheduler = requestAnimationFrame
    this.__container = (injector.get(ElementRef as Type<ElementRef>)).nativeElement
    const renderer = injector.get(Renderer2 as Type<Renderer2>, null!) as Renderer2 | null
    this.__renderer = renderer || (injector.get(RendererFactory2 as Type<RendererFactory2>)).createRenderer(null, null)
  }

  abstract render(): NodeDef | null

  ngDoCheck(): void {
    this.__def = this.render()

    this.__hooks = []
    this.__detectChanges()
  }

  protected __createRenderKit(): RenderKit {
    return createRenderKit(this.__cfr, this.__injector, this.__iDiffers, this.__kDiffers, this.__hooks, this.__renderer, this)
  }
}
