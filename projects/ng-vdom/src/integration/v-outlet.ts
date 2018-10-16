import { Directive, Injector, Input } from '@angular/core'
import { VNode } from '../shared/node'
import { Renderable } from './renderable'

@Directive({
  selector: 'v-outlet',
})
export class VOutlet extends Renderable {
  @Input() def: VNode | null = null

  constructor(
    injector: Injector,
  ) {
    super(injector)
  }

  render() {
    return this.def
  }
}
