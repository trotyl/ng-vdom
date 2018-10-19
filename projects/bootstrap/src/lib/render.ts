import { platformBrowser } from '@angular/platform-browser'
import { VDomBootstrapModule } from './bootstrap.module'
import { optionQueue, outletRegistry } from './data'

// TOOD: support other overloads
export function render<P>(element: ReactElement<P>, container: Element | null, callback?: () => void): Component<P, ComponentState> | Element | void {
  if (container && outletRegistry.has(container)) {
    const [component, app] = outletRegistry.get(container)!
    component.instance.element = element
    app.tick()
  } else {
    optionQueue.push({ element, container })

    platformBrowser()
      .bootstrapModuleFactory(VDomBootstrapModule.ngFactory, { ngZone: 'noop' })
      .then(() => {
        if (callback) { callback() }
      })
  }
}
