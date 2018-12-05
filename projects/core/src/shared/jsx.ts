// tslint:disable:no-empty-interface

import { Attributes, ClassAttributes, ElementDef } from './types'

declare global {
  interface Object {
    __props__: any
  }

  namespace JSX {
    interface Element extends ElementDef {}

    interface ElementAttributesProperty {
      __props__: {}
    }

    interface ElementChildrenAttribute {
      children: {}
    }

    interface ElementClass {}

    interface IntrinsicAttributes extends Attributes {}

    interface IntrinsicClassAttributes extends ClassAttributes {}

    interface IntrinsicElements {
      [elementName: string]: any
    }
  }
}
