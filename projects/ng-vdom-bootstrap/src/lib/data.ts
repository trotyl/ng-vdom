import { ApplicationRef, ComponentRef } from '@angular/core'
import { ReactElement } from 'react'
import { VDomOutlet } from 'ng-vdom'

export interface BootstrapOption {
  element: ReactElement<any>
  container: Element | null
}

export const optionQueue: BootstrapOption[] = []

export const outletRegistry = new WeakMap<Element, [ComponentRef<VDomOutlet>, ApplicationRef]>()
