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

export function insertByIndex(container: Element, node: Node, currentIndex: number, nodes: Node[]): void {
  const nextNode = currentIndex === nodes.length ? null : nodes[currentIndex]
  insertBefore(container, node, nextNode)
  if (isNullOrUndefined(nextNode)) {
    nodes.push(node)
  } else {
    nodes.splice(currentIndex, 0, node)
  }
}

export function moveByIndex(container: Element, previousIndex: number, currentIndex: number, nodes: Node[]): void {
  const node = removeByIndex(container, previousIndex, nodes)
  insertByIndex(container, node, currentIndex, nodes)
}

export function removeByIndex(container: Element, previousIndex: number, nodes: Node[]): Node {
  const node = nodes[previousIndex]
  getCurrentRenderer().removeChild(container, node)
  nodes.splice(previousIndex, 1)
  return node
}
