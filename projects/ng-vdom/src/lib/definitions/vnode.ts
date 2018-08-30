import { ComponentElement, DOMElement, SFCElement } from 'react'

export type ComponentVNode = ComponentElement<any, any> | SFCElement<HTMLElement>
export type ElementVNode = DOMElement<any, any>
export type TextVNode = string | number
