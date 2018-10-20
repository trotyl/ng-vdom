import { getCurrentRenderer } from '../shared/context'
import { isNullOrUndefined } from '../shared/lang'

export function createComment(value: string): Comment {
  const renderer = getCurrentRenderer()
  return renderer.createComment(value)
}

export function createElement(name: string): Element {
  const renderer = getCurrentRenderer()
  return renderer.createElement(name)
}

export function createTextNode(value: string): Text {
  const renderer = getCurrentRenderer()
  return renderer.createText(value)
}

export function insertBefore(container: Element, newNode: Node, referenceNode: Node | null): void {
  const renderer = getCurrentRenderer()
  if (!isNullOrUndefined(referenceNode)) {
    renderer.insertBefore(container, newNode, referenceNode)
  } else {
    renderer.appendChild(container, newNode)
  }
}

export function removeChild(container: Element, child: Node): void {
  const renderer = getCurrentRenderer()
  renderer.removeChild(container, child)
}

export function replaceChild(container: Element, newChild: Node, oldChild: Node): void {
  insertBefore(container, newChild, oldChild)
  removeChild(container, oldChild)
}

export function setNodeValue(node: Node, value: string): void {
  const renderer = getCurrentRenderer()
  renderer.setValue(node, value)
}
