import { Directive, Injector, Input } from '@angular/core'
import { NodeDef } from '../shared/types'
import { Renderable } from './renderable'

@Directive({
  selector: 'v-outlet',
})
export class VOutlet extends Renderable {
  @Input() def: NodeDef | null = null

  constructor(
    injector: Injector,
  ) {
    super(injector)
  }

  render() {
    return this.def
  }
}
