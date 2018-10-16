import { IterableDiffer } from '@angular/core'
import { getCurrentRenderer } from '../shared/context'
import { isComponentElement, isComponentType, isNativeElement, isVElement, isVText, nodeTypeOf, ComponentElement, NativeElement, StatelessComponentElement, VNode, VText } from '../shared/node'
import { mount } from './mount'
import { patchProp } from './props'
import { getChildNodes, getComponentMeta, getElementMeta, setChildNodes, setComponentMeta, setElementMeta } from './registry'
import { unmount } from './unmount'

export function patch(lastVNode: VNode, nextVNode: VNode, host: Node, container: Element): Node {
  if (nodeTypeOf(lastVNode) !== nodeTypeOf(nextVNode)) {
    return replaceWithNewNode(lastVNode, nextVNode, host, container)
  } else if (isVElement(nextVNode)) {
    if (isNativeElement(nextVNode)) {
      return patchElement(lastVNode as NativeElement, nextVNode, host as Element, container)
    } else if (isComponentElement(nextVNode)) {
      return patchComponent(lastVNode as ComponentElement, nextVNode, host, container)
    } else {
      throw new Error(`...`)
    }
  } else if (isVText(nextVNode)) {
    return patchText(lastVNode as VText, nextVNode, host as Text, container)
  } else {
    throw new Error(`...`)
  }
}

function replaceWithNewNode(lastVNode: VNode, nextVNode: VNode, lastHost: Node, container: Element): Node {
  const nodes = getChildNodes(container)
  unmount(lastVNode, container)
  const index = nodes.indexOf(lastHost)
  remove(index, nodes, container)
  const newNode = mount(nextVNode, null)
  insert(newNode, index, nodes, container)
  return newNode
}

function patchElement(lastVNode: NativeElement, nextVNode: NativeElement, host: Element, container: Element): Node {
  const { events, propDiffer, childDiffer } = getElementMeta(lastVNode)
  let childNodes = getChildNodes(host)

  const { children: lastChildren, props: lastProps } = lastVNode
  const { children: nextChildren, props: nextProps } = nextVNode

  if (lastProps !== nextProps) {
    const changes = propDiffer.diff(nextProps)
    if (changes != null) {
      changes.forEachAddedItem(record => patchProp(record.key, record.currentValue, host, events))
      changes.forEachChangedItem(record => patchProp(record.key, record.currentValue, host, events))
      changes.forEachRemovedItem(record => patchProp(record.key, null, host, events))
    }
  }

  childNodes = patchChildren(lastChildren, nextChildren, childDiffer, childNodes, host)

  setElementMeta(nextVNode, { events, propDiffer, childDiffer })
  setChildNodes(host, childNodes)

  return host
}

function patchChildren(lastChildren: VNode[], nextChildren: VNode[], childDiffer: IterableDiffer<VNode>, childNodes: Node[], container: Element): Node[] {
  const changes = childDiffer.diff(nextChildren)

  if (changes) {
    changes.forEachOperation(({ item, previousIndex, currentIndex }, temporaryPreviousIndex, temporaryCurrentIndex) => {
      if (previousIndex == null) {
        const node = mount(item, null)
        insert(node, temporaryCurrentIndex!, childNodes, container)
      } else if (temporaryCurrentIndex == null) {
        remove(temporaryPreviousIndex!, childNodes, container)
      } else {
        const node = remove(temporaryPreviousIndex!, childNodes, container)
        insert(node, temporaryCurrentIndex, childNodes, container)
        patch(lastChildren[previousIndex], nextChildren[currentIndex!], childNodes[temporaryCurrentIndex], container)
      }
    })

    changes.forEachIdentityChange(({ item, previousIndex, currentIndex }) => {
      patch(lastChildren[previousIndex!], item, childNodes[currentIndex!], container)
    })
  } else {
    for (let i = 0; i < nextChildren.length; i++) {
      patch(nextChildren[i], nextChildren[i], childNodes[i], container)
    }
  }

  return childNodes
}

function patchComponent(lastVNode: ComponentElement | StatelessComponentElement, nextVNode: ComponentElement | StatelessComponentElement, host: Node, container: Element): Node {
  if (lastVNode.type !== nextVNode.type || lastVNode.key !== nextVNode.key) {
    return replaceWithNewNode(lastVNode, nextVNode, host, container)
  }

  const { input: lastInput, propDiffer, instance } = getComponentMeta(lastVNode)
  const type = nextVNode.type
  const props = nextVNode.props

  let nextInput = lastInput

  if (isComponentType(type)) {
    (instance as any).props = props
    nextInput = instance!.render()
  } else {
    const changes = propDiffer!.diff(nextVNode.props)

    if (changes) {
      nextInput = type(props)
    }
  }

  setComponentMeta(nextVNode, { input: nextInput, propDiffer, instance })
  return patch(lastInput, nextInput, host, container)
}

function patchText(lastVNode: VText, nextVNode: VText, host: Text, container: Element): Node {
  if (lastVNode === nextVNode) {
    return host
  }

  const nextText = `${nextVNode}`
  if (!host) {
    throw new Error(`Missing text node`)
  }
  getCurrentRenderer().setValue(host, nextText)

  return host
}

function remove(previousIndex: number, childNodes: Node[], container: Element): Node {
  const node = childNodes[previousIndex]
  getCurrentRenderer().removeChild(container, node)
  childNodes.splice(previousIndex, 1)
  return node
}

function insert(node: Node, currentIndex: number, childNodes: Node[], container: Element): void {
  if (currentIndex === childNodes.length) {
    getCurrentRenderer().appendChild(container, node)
    childNodes.push(node)
  } else {
    const nextNode = childNodes[currentIndex]
    getCurrentRenderer().insertBefore(container, node, nextNode)
    childNodes.splice(currentIndex, 0, node)
  }
}
