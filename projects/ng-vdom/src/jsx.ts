// tslint:disable:no-empty-interface

import { VElement } from './entities/types'

declare global {
  namespace JSX {
    interface Element extends VElement { }
    interface ElementClass {
      render: any
    }
    interface IntrinsicElements {
      [elementName: string]: any
    }
  }
}
