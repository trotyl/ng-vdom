import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { VDomModule } from 'ng-vdom'

import { AppComponent } from './app.component'

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    VDomModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
