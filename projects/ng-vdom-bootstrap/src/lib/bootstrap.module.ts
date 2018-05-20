import { ApplicationRef, ComponentFactoryResolver, Inject, Injector, NgModule, NgModuleFactory } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { ReactElement } from 'react'
import { VDomModule, VDomOutlet } from 'ng-vdom'
import { ROOT_ELEMENT, ROOT_CONTAINER } from './token'

@NgModule({
  imports: [ BrowserModule, VDomModule ],
})
export class VDomBootstrapModule {
  static ngFactory: NgModuleFactory<VDomBootstrapModule>

  constructor(
    private injector: Injector,
    private resolver: ComponentFactoryResolver,
    @Inject(ROOT_ELEMENT) private element: ReactElement<any>,
    @Inject(ROOT_CONTAINER) private container: Element,
  ) { }

  ngDoBootstrap(app: ApplicationRef): void {
    const componentFactory = this.resolver.resolveComponentFactory(VDomOutlet)
    const componentRef = componentFactory.create(this.injector, undefined, this.container)
    componentRef.instance.element = this.element
    app.attachView(componentRef.hostView)
  }
}
