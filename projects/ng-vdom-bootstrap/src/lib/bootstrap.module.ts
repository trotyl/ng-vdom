import { ApplicationRef, ComponentFactoryResolver, ComponentRef, Inject, Injector, NgModule, NgModuleFactory, NgZone } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { ReactElement } from 'react'
import { VDomModule, VDomOutlet } from 'ng-vdom'
import { optionQueue, outletRegistry } from './data'

@NgModule({
  imports: [ BrowserModule, VDomModule ],
})
export class VDomBootstrapModule {
  static ngFactory: NgModuleFactory<VDomBootstrapModule>

  constructor(
    private injector: Injector,
    private resolver: ComponentFactoryResolver,
    private ngZone: NgZone,
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
    const component = componentFactory.create(this.injector, undefined, option.container)
    app.attachView(component.hostView)
    outletRegistry.set(option.container, [component, app])

    component.instance.element = option.element
    app.tick()
  }
}
