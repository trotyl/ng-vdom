// tslint:disable:no-empty-interface

import { Component } from './component'
import { Attributes, ClassAttributes, ElementDef } from './types'

declare global {
  namespace JSX {
    interface Element extends ElementDef { }

    interface ElementAttributesProperty {
      props: { }
    }

    interface ElementChildrenAttribute {
      children: { }
    }

    interface ElementClass extends Component { }

    interface IntrinsicAttributes extends Attributes { }

    interface IntrinsicClassAttributes extends ClassAttributes { }

    interface IntrinsicElements {
      [elementName: string]: unknown
    }
  }
}
