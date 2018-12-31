import { RenderKit } from '../shared/render-kit'
import { ChildDiffer, VNode } from '../shared/types'
import { mount } from './mount'
import { patch } from './patch'
import { detach, insertBefore } from './render'

export function mountArray(kit: RenderKit, vNodes: VNode[]): Node[] {
  const nodes: Node[] = []
  for (let i = 0; i < vNodes.length; i++) {
    const vNode = vNodes[i]
    mount(kit, vNode, null, null)
    nodes.push(vNode.native!)
  }
  return nodes
}

export function patchArray(kit: RenderKit, differ: ChildDiffer, lastChildren: VNode[], nextChildren: VNode[], container: Element): void {
  const nodes = lastChildren.map(vNode => vNode.native!)

  const changes = differ.diff(nextChildren)

  if (changes != null) {
    changes.forEachOperation(({ item, previousIndex, currentIndex }, temporaryPreviousIndex, temporaryCurrentIndex) => {
      if (previousIndex == null) {
        mount(kit, item, null, null)
        insertByIndex(kit, container, item.native!, temporaryCurrentIndex!, nodes)
      } else if (temporaryCurrentIndex == null) {
        removeByIndex(kit, temporaryPreviousIndex!, nodes)
      } else {
        moveByIndex(kit, container, temporaryPreviousIndex!, temporaryCurrentIndex, nodes)
        patch(kit, lastChildren[previousIndex], nextChildren[currentIndex!])
      }
    })

    changes.forEachIdentityChange(({ item, previousIndex }) => {
      patch(kit, lastChildren[previousIndex!], item)
    })
  } else {
    for (let i = 0; i < nextChildren.length; i++) {
      patch(kit, nextChildren[i], nextChildren[i])
    }
  }
}

function insertByIndex(kit: RenderKit, container: Element, node: Node, currentIndex: number, nodes: Node[]): void {
  const nextNode = currentIndex === nodes.length ? null : nodes[currentIndex]
  insertBefore(kit, container, node, nextNode)
  if (nextNode == null) {
    nodes.push(node)
  } else {
    nodes.splice(currentIndex, 0, node)
  }
}

function moveByIndex(kit: RenderKit, container: Element, previousIndex: number, currentIndex: number, nodes: Node[]): void {
  const node = removeByIndex(kit, previousIndex, nodes)
  insertByIndex(kit, container, node, currentIndex, nodes)
}

function removeByIndex(kit: RenderKit, previousIndex: number, nodes: Node[]): Node {
  const node = nodes[previousIndex]
  detach(kit, node)
  nodes.splice(previousIndex, 1)
  return node
}
