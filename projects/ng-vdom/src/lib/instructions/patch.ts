import { KeyValueDiffers, Renderer2, IterableChangeRecord, IterableDiffer } from '@angular/core'
import { ReactNode, DOMElement, HTMLAttributes, ComponentElement, SFCElement } from 'react'
import { TextVNode, ComponentVNode, ElementVNode } from '../definitions/vnode'
import { getRenderer } from '../utils/context'
import { isDOMElement, isComponentElement, nodeTypeOf, isTextElement, isClassComponentElement } from '../utils/vnode'
import { mount } from './mount'
import { patchProp } from './props'
import { getElementMeta, getComponentMeta, setElementMeta, setComponentMeta } from './registry'

export function replaceWithNewNode(lastVNode: ReactNode, nextVNode: ReactNode, host: Node, container: Element): Node {
  // TODO: support replace node
  throw new Error(`...`)
}

export function patch(lastVNode: ReactNode, nextVNode: ReactNode, host: Node, container: Element, lifecycle: Function[]): Node {
  if (nodeTypeOf(lastVNode) !== nodeTypeOf(nextVNode)) {
    return replaceWithNewNode(lastVNode, nextVNode, host, container)
  } else if (isDOMElement(nextVNode)) {
    return patchElement(lastVNode as ElementVNode, nextVNode, host as Element, container, lifecycle)
  } else if (isComponentElement(nextVNode)) {
    return patchComponent(lastVNode as ComponentVNode, nextVNode, host, container, lifecycle)
  } else if (isTextElement(nextVNode)) {
    return patchText(lastVNode as TextVNode, nextVNode, host as Text, container)
  } else {
    throw new Error(`...`)
  }
}

export function patchElement(lastVNode: ElementVNode, nextVNode: ElementVNode, host: Element, container: Element, lifecycle: Function[]): Node {
  if (lastVNode.type !== nextVNode.type) {
    return replaceWithNewNode(lastVNode, nextVNode, host, container)
  }

  const { events, propDiffer, childDiffer, childNodes: lastChildNodes } = getElementMeta(lastVNode)
  let childNodes = lastChildNodes

  const { children: lastChildren, className: lastClassName } = lastVNode.props
  const { children: nextChildren, className: nextClassName, ...nextProps } = nextVNode.props

  if (lastVNode.props !== nextVNode.props) {
    const changes = propDiffer.diff(nextProps)
    if (changes) {
      changes.forEachItem(record => patchProp(record.key, record.currentValue, host, events))
    }
  }

  const boxedLastChildren = Array.isArray(lastChildren) ? lastChildren : [lastChildren]
  const boxedNextChildren = Array.isArray(nextChildren) ? nextChildren : [nextChildren]
  childNodes = patchChildren(boxedLastChildren, boxedNextChildren, childDiffer, childNodes, host, lifecycle)

  setElementMeta(nextVNode, { events, propDiffer, childDiffer, childNodes })

  return host
}

export function patchChildren(lastChildren: ReactNode[], nextChildren: ReactNode[], childDiffer: IterableDiffer<ReactNode>, childNodes: Node[], container: Element, lifecycle: Function[]): Node[] {
  const changes = childDiffer.diff(nextChildren)

  if (changes) {
    changes.forEachOperation(({ item, previousIndex, currentIndex }, temporaryPreviousIndex, temporaryCurrentIndex) => {
      if (previousIndex == null) {
        const node = mount(item, null, lifecycle)
        insert(node, temporaryCurrentIndex!, childNodes, container)
      } else if (temporaryCurrentIndex == null) {
        remove(temporaryPreviousIndex!, childNodes, container)
      } else {
        const node = remove(temporaryPreviousIndex!, childNodes, container)
        insert(node, temporaryCurrentIndex, childNodes, container)
        patch(lastChildren[previousIndex], nextChildren[currentIndex!], childNodes[temporaryCurrentIndex], container, lifecycle)
      }
    })

    changes.forEachIdentityChange(({ item, previousIndex, currentIndex }) => {
      patch(lastChildren[previousIndex!], item, childNodes[currentIndex!], container, lifecycle)
    })
  } else {
    for (let i = 0; i < nextChildren.length; i++) {
      patch(nextChildren[i], nextChildren[i], childNodes[i], container, lifecycle)
    }
  }

  return childNodes
}

export function patchComponent(lastVNode: ComponentVNode, nextVNode: ComponentVNode, host: Node, container: Element, lifecycle: Function[]): Node {

  if (lastVNode.type !== nextVNode.type || lastVNode.key !== nextVNode.key) {
    return replaceWithNewNode(lastVNode, nextVNode, host, container)
  }

  const { input: lastInput, propDiffer, instance } = getComponentMeta(lastVNode)
  const type = nextVNode.type
  const props = nextVNode.props

  let nextInput = lastInput

  if (isClassComponentElement(type)) {
    instance!.props = props
    nextInput = instance!.render()
  } else {
    const changes = propDiffer!.diff(nextVNode.props)

    if (changes) {
      nextInput = type(props)
    }
  }

  setComponentMeta(nextVNode, { input: nextInput, propDiffer, instance })
  return patch(lastInput, nextInput, host, container, lifecycle)
}

export function patchText(lastVNode: TextVNode, nextVNode: TextVNode, host: Text, container: Element): Node {
  if (lastVNode === nextVNode) {
    return host
  }

  const nextText = `${nextVNode}`
  if (!host) {
    throw new Error(`Missing text node`)
  }
  getRenderer().setValue(host, nextText)

  return host
}

function remove(previousIndex: number, childNodes: Node[], container: Element): Node {
  const node = childNodes[previousIndex]
  getRenderer().removeChild(container, node)
  childNodes.splice(previousIndex, 1)
  return node
}

function insert(node: Node, currentIndex: number, childNodes: Node[], container: Element): void {
  if (currentIndex! === childNodes.length - 1) {
    getRenderer().appendChild(container, node)
    childNodes.push(node)
  } else {
    const nextNode = childNodes[currentIndex + 1]
    getRenderer().insertBefore(container, node, nextNode)
    childNodes.splice(currentIndex, 0, node)
  }
}
