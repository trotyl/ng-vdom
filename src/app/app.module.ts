import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { VDomModule } from 'ng-vdom'

import { AppComponent } from './app.component'
import { HelloComponent } from './hello.component'

@NgModule({
  declarations: [
    AppComponent,
    HelloComponent,
  ],
  imports: [
    BrowserModule,
    VDomModule,
  ],
  providers: [],
  entryComponents: [
    HelloComponent,
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
