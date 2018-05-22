import { KeyValueDiffers, Renderer2, IterableChangeRecord } from '@angular/core'
import { ReactNode, DOMElement, HTMLAttributes, ComponentElement } from 'react'
import { mount } from './mount'
import { patchProp } from './props'
import { isDOMElement, isComponentElement, nodeTypeOf, isTextElement } from './utils'
import { renderer, setVNode, getVNode, getProps, getChildren, getChildNodes } from './registry'

export function replaceWithNewNode(nextVNode: ReactNode, host: Node, container: Element): Node {
  // TODO: support replace node
  throw new Error(`...`)
}

export function patch(node: ReactNode, host: Node, container: Element): Node {
  const lastVNode = getVNode(host)

  if (lastVNode !== node) {
    if (nodeTypeOf(lastVNode) !== nodeTypeOf(node)) {
      return replaceWithNewNode(node, host, container)
    } else if (isDOMElement(node)) {
      return patchElement(node, host as Element, container)
    } else if (isComponentElement(node)) {
      return patchComponent(node, host, container)
    } else if (isTextElement(node)) {
      return patchText(node, host as Text, container)
    }
  }

  return host
}

export function patchElement(node: DOMElement<any, any>, host: Element, container: Element): Node {
  const lastVNode = getVNode(host) as DOMElement<HTMLAttributes<Element>, Element>
  if (lastVNode.type !== node.type) {
    return replaceWithNewNode(node, host, container)
  }

  if (lastVNode.props !== node.props) {
    const { children: lastChildren, className: lastClassName } = lastVNode.props
    const { children: nextChildren, className: nextClassName, ...nextProps } = node.props

    const differ = getProps(host)
    const changes = differ.diff(nextProps)
    if (changes) {
      changes.forEachItem(record => renderer.setProperty(host, record.key, record.currentValue))
    }

    if (lastChildren !== nextChildren) {
      const childrenInArray = Array.isArray(nextChildren) ? nextChildren : [nextChildren]
      patchChildren(childrenInArray, host)
    }
  }

  return host
}

export function patchChildren(children: ReactNode[], container: Element): void {
  const differ = getChildren(container)
  const changes = differ.diff(children)
  const childNodes = getChildNodes(container)
  if (changes) {
    changes.forEachOperation((record: IterableChangeRecord<ReactNode>, previousIndex: number | null, currentIndex: number | null) => {
      if (record.previousIndex == null) {
        const node = setVNode(mount(record.item, null), record.item)
        insert(node, currentIndex!, childNodes, container)
      } else if (currentIndex == null) {
        remove(previousIndex!, childNodes, container)
      } else {
        const node = remove(previousIndex!, childNodes, container)
        insert(node, currentIndex, childNodes, container)
      }
    })
  }

  for (let i = 0; i < children.length; i++) {
    patch(children[i], childNodes[i], container)
  }
}

export function patchComponent(node: ComponentElement<any, any>, host: Node, container: Element): Node {
  // TODO: add support for component
  throw new Error(`Component not supported yet`)
}

export function patchText(node: string | number | boolean, host: Text, container: Element): Node {
  const nextText = `${node}`
  if (!host) {
    throw new Error(`Missing text node`)
  }
  renderer.setValue(host, nextText)

  return host
}

function remove(previousIndex: number, childNodes: Node[], container: Element): Node {
  const node = childNodes[previousIndex]
  renderer.removeChild(container, node)
  childNodes.splice(previousIndex, 1)
  return node
}

function insert(node: Node, currentIndex: number, childNodes: Node[], container: Element): void {
  if (currentIndex! === childNodes.length - 1) {
    renderer.appendChild(container, node)
    childNodes.push(node)
  } else {
    const nextNode = childNodes[currentIndex + 1]
    renderer.insertBefore(container, node, nextNode)
    childNodes.splice(currentIndex, 0, node)
  }
}
