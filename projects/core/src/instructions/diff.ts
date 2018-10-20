import { isNullOrUndefined } from '../shared/lang'
import { insertBefore, removeChild } from './render'

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
  removeChild(container, node)
  nodes.splice(previousIndex, 1)
  return node
}
