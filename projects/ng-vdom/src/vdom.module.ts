import { NgModule } from '@angular/core'
import { VDomOutlet } from './vdom-outlet'

@NgModule({
  declarations: [ VDomOutlet ],
  exports: [ VDomOutlet ],
  entryComponents: [ VDomOutlet ],
})
export class VDomModule { }
