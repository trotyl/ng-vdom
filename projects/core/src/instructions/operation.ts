import { getCurrentRenderer } from '../shared/context'

export function appendChild(container: Element, node: Node): void {
  const renderer = getCurrentRenderer()
  renderer.appendChild(container, node)
}

export function insertBefore(container: Element, newNode: Node, referenceNode: Node): void {
  const renderer = getCurrentRenderer()
  renderer.insertBefore(container, newNode, referenceNode)
}

export function removeChild(container: Element, child: Node): void {
  const renderer = getCurrentRenderer()
  renderer.removeChild(container, child)
}

export function replaceChild(container: Element, newChild: Node, oldChild: Node): void {
  insertBefore(container, newChild, oldChild)
  removeChild(container, oldChild)
}

export function insertByIndex(container: Element, node: Node, currentIndex: number, nodes: Node[]): void {
  if (currentIndex === nodes.length) {
    appendChild(container, node)
    nodes.push(node)
  } else {
    const nextNode = nodes[currentIndex]
    insertBefore(container, node, nextNode)
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
