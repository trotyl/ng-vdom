import { platformBrowser } from '@angular/platform-browser'
import { Component, ComponentState, ReactElement } from 'react'
import { VDomBootstrapModule } from './bootstrap.module'
import { ROOT_ELEMENT, ROOT_CONTAINER } from './token'

// TODO: allow container to be null
// TOOD: support other overloads
export function render<P>(element: ReactElement<P>, container: Element | null, callback?: () => void): Component<P, ComponentState> | Element | void {
  platformBrowser([
    { provide: ROOT_ELEMENT, useValue: element },
    { provide: ROOT_CONTAINER, useValue: container },
  ])
  .bootstrapModuleFactory(VDomBootstrapModule.ngFactory)
  .then(() => {
    if (callback) { callback() }
  })
}
