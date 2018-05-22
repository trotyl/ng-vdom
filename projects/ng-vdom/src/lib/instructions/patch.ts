import { KeyValueDiffers, Renderer2, IterableChangeRecord } from '@angular/core'
import { ReactNode, DOMElement, HTMLAttributes, ComponentElement } from 'react'
import { mount } from './mount'
import { patchProp } from './props'
import { isDomElement, isComponent, nodeTypeOf, isText } from './utils'
import { setVNode, getVNode, getProps, getChildren, getChildNodes } from './registry'

export function replaceWithNewNode(nextVNode: ReactNode, host: Node, container: Element, renderer: Renderer2): Node {
  // TODO: support replace node
  throw new Error(`...`)
}

export function patch(nextVNode: ReactNode, host: Node, container: Element, renderer: Renderer2): Node {
  const lastVNode = getVNode(host)

  if (lastVNode !== nextVNode) {
    if (nodeTypeOf(lastVNode) !== nodeTypeOf(nextVNode)) {
      return replaceWithNewNode(nextVNode, host, container, renderer)
    } else if (isDomElement(nextVNode)) {
      return patchElement(nextVNode, host as Element, container, renderer)
    } else if (isComponent(nextVNode)) {
      return patchComponent(nextVNode, host, container, renderer)
    } else if (isText(nextVNode)) {
      return patchText(nextVNode, host as Text, container, renderer)
    }
  }

  return host
}

export function patchElement(nextVNode: DOMElement<HTMLAttributes<Element>, Element>, host: Element, container: Element, renderer: Renderer2): Node {
  const lastVNode = getVNode(host) as DOMElement<HTMLAttributes<Element>, Element>
  if (lastVNode.type !== nextVNode.type) {
    return replaceWithNewNode(nextVNode, host, container, renderer)
  }

  if (lastVNode.props !== nextVNode.props) {
    const { children: lastChildren, className: lastClassName } = lastVNode.props
    const { children: nextChildren, className: nextClassName, ...nextProps } = nextVNode.props

    const differ = getProps(host)
    const changes = differ.diff(nextProps)
    if (changes) {
      changes.forEachItem(record => renderer.setProperty(host, record.key, record.currentValue))
    }

    if (lastChildren !== nextChildren) {
      const childrenInArray = Array.isArray(nextChildren) ? nextChildren : [nextChildren]
      patchChildren(childrenInArray, host, renderer)
    }
  }

  return setVNode(host, nextVNode)
}

export function patchChildren(nextChildren: ReactNode[], container: Element, renderer: Renderer2): void {
  const differ = getChildren(container)
  const changes = differ.diff(nextChildren)
  const childNodes = getChildNodes(container)
  if (changes) {
    changes.forEachOperation((record: IterableChangeRecord<ReactNode>, previousIndex: number | null, currentIndex: number | null) => {
      if (record.previousIndex == null) {
        const node = mount(record.item, null, renderer)
        insert(node, currentIndex!, childNodes, container, renderer)
      } else if (currentIndex == null) {
        remove(previousIndex!, childNodes, container, renderer)
      } else {
        const node = remove(previousIndex!, childNodes, container, renderer)
        insert(node, currentIndex, childNodes, container, renderer)
      }
    })
  }

  for (let i = 0; i < nextChildren.length; i++) {
    patch(nextChildren[i], childNodes[i], container, renderer)
  }
}

export function patchComponent(nextVNode: ComponentElement<any, any>, host: Node, container: Element, renderer: Renderer2): Node {
  // TODO: add support for component
  throw new Error(`Component not supported yet`)
}

export function patchText(nextVNode: string | number | boolean, host: Text, container: Element, renderer: Renderer2): Node {
  const nextText = `${nextVNode}`
  if (!host) {
    throw new Error(`Missing text node`)
  }
  renderer.setValue(host, nextText)

  return setVNode(host, nextVNode)
}

function remove(previousIndex: number, childNodes: Node[], container: Element, renderer: Renderer2): Node {
  const node = childNodes[previousIndex]
  renderer.removeChild(container, node)
  childNodes.splice(previousIndex, 1)
  return node
}

function insert(node: Node, currentIndex: number, childNodes: Node[], container: Element, renderer: Renderer2): void {
  if (currentIndex! === childNodes.length - 1) {
    renderer.appendChild(container, node)
    childNodes.push(node)
  } else {
    const nextNode = childNodes[currentIndex + 1]
    renderer.insertBefore(container, node, nextNode)
    childNodes.splice(currentIndex, 0, node)
  }
}
