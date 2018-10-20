import { DoCheck, ElementRef, Injectable, Injector, IterableDiffers, KeyValueDiffers, Renderer2, RendererFactory2 } from '@angular/core'
import { setCurrentIterableDiffers, setCurrentKeyValueDiffers, setCurrentRenderer } from '../shared/context'
import { NodeDef } from '../shared/types'
import { Container } from './container'

@Injectable()
export abstract class Renderable extends Container implements DoCheck {
  protected __renderer: Renderer2
  protected __iDiffers: IterableDiffers
  protected __kDiffers: KeyValueDiffers

  constructor(injector: Injector) {
    super()

    this.__container = (injector.get(ElementRef) as ElementRef).nativeElement
    this.__iDiffers = (injector.get(IterableDiffers) as IterableDiffers)
    this.__kDiffers = (injector.get(KeyValueDiffers) as KeyValueDiffers)

    const renderer = injector.get(Renderer2, null) as Renderer2 | null
    this.__renderer = renderer != null ? renderer : (injector.get(RendererFactory2) as RendererFactory2).createRenderer(null, null)
  }

  abstract render(): NodeDef | null

  ngDoCheck(): void {
    this.__def = this.render()

    this.__detectChanges()
  }

  protected __switchContext(): () => void {
    const previousIDiffers = setCurrentIterableDiffers(this.__iDiffers)
    const previousKDiffers = setCurrentKeyValueDiffers(this.__kDiffers)
    const previousRenderer = setCurrentRenderer(this.__renderer)

    return () => {
      setCurrentIterableDiffers(previousIDiffers)
      setCurrentKeyValueDiffers(previousKDiffers)
      setCurrentRenderer(previousRenderer)
    }
  }
}
