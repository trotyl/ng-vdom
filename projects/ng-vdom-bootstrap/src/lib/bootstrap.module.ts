import { ApplicationRef, ComponentFactoryResolver, Inject, Injector, NgModule, NgModuleFactory } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { ReactElement } from 'react'
import { VDomModule, VDomOutlet } from 'ng-vdom'
import { optionQueue } from './data'

@NgModule({
  imports: [ BrowserModule, VDomModule ],
})
export class VDomBootstrapModule {
  static ngFactory: NgModuleFactory<VDomBootstrapModule>

  constructor(
    private injector: Injector,
    private resolver: ComponentFactoryResolver,
  ) { }

  ngDoBootstrap(app: ApplicationRef): void {
    const option = optionQueue.shift()
    if (option == null) {
      throw new Error(`Bootstrap option not available.`)
    }

    if (option.element == null) {
      throw new Error(`VirtualDOM element to bootstrap not specified.`)
    }

    // TODO: allow container to be null
    if (option.container == null) {
      throw new Error(`Container element not specified.`)
    }

    const componentFactory = this.resolver.resolveComponentFactory(VDomOutlet)
    const componentRef = componentFactory.create(this.injector, undefined, option.container)
    componentRef.instance.element = option.element
    app.attachView(componentRef.hostView)
  }
}
