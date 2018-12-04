import { isNil } from '../shared/lang'
import { RenderKit } from '../shared/render-kit'
import { insertBefore, removeChild } from './render'

export function insertByIndex(kit: RenderKit, container: Element, node: Node, currentIndex: number, nodes: Node[]): void {
  const nextNode = currentIndex === nodes.length ? null : nodes[currentIndex]
  insertBefore(kit, container, node, nextNode)
  if (isNil(nextNode)) {
    nodes.push(node)
  } else {
    nodes.splice(currentIndex, 0, node)
  }
}

export function moveByIndex(kit: RenderKit, container: Element, previousIndex: number, currentIndex: number, nodes: Node[]): void {
  const node = removeByIndex(kit, container, previousIndex, nodes)
  insertByIndex(kit, container, node, currentIndex, nodes)
}

export function removeByIndex(kit: RenderKit, container: Element, previousIndex: number, nodes: Node[]): Node {
  const node = nodes[previousIndex]
  removeChild(kit, container, node)
  nodes.splice(previousIndex, 1)
  return node
}
