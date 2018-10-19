// tslint:disable:no-empty-interface

import { Attributes, ClassAttributes, VElement } from './node'

declare global {
  namespace JSX {
    interface Element extends VElement { }

    interface ElementAttributesProperty {
      props: {}
    }

    interface ElementChildrenAttribute {
      children: {}
    }

    interface ElementClass {
      render: any
    }

    interface IntrinsicAttributes extends Attributes { }

    interface IntrinsicClassAttributes extends ClassAttributes { }

    interface IntrinsicElements {
      [elementName: string]: any
    }
  }
}
