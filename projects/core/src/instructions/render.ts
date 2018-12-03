import { getCurrentRenderer } from '../shared/context'
import { isNil } from '../shared/lang'

export function createComment(value: string): Comment {
  return getCurrentRenderer().createComment(value)
}

export function createElement(name: string): Element {
  return getCurrentRenderer().createElement(name)
}

export function createTextNode(value: string): Text {
  return getCurrentRenderer().createText(value)
}

export function insertBefore(container: Element, newNode: Node, referenceNode: Node | null): void {
  const renderer = getCurrentRenderer()
  if (!isNil(referenceNode)) {
    renderer.insertBefore(container, newNode, referenceNode)
  } else {
    renderer.appendChild(container, newNode)
  }
}

export function removeChild(container: Element, child: Node): void {
  getCurrentRenderer().removeChild(container, child)
}

export function setNodeValue(node: Node, value: string): void {
  getCurrentRenderer().setValue(node, value)
}
