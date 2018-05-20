import { platformBrowser } from '@angular/platform-browser'
import { Component, ComponentState, ReactElement } from 'react'
import { VDomBootstrapModule } from './bootstrap.module'
import { optionQueue } from './data'

// TOOD: support other overloads
export function render<P>(element: ReactElement<P>, container: Element | null, callback?: () => void): Component<P, ComponentState> | Element | void {
  optionQueue.push({ element, container })

  platformBrowser()
    .bootstrapModuleFactory(VDomBootstrapModule.ngFactory)
    .then(() => {
      if (callback) { callback() }
    })
}
