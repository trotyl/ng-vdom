import { isNil } from '../shared/lang'
import { RenderKit, RENDERER } from '../shared/render-kit'

export function createComment(kit: RenderKit, value: string): Comment {
  return kit[RENDERER].createComment(value)
}

export function createElement(kit: RenderKit, name: string): Element {
  return kit[RENDERER].createElement(name)
}

export function createTextNode(kit: RenderKit, value: string): Text {
  return kit[RENDERER].createText(value)
}

export function insertBefore(kit: RenderKit, container: Element, newNode: Node, referenceNode: Node | null): void {
  const renderer = kit[RENDERER]
  if (!isNil(referenceNode)) {
    renderer.insertBefore(container, newNode, referenceNode)
  } else {
    renderer.appendChild(container, newNode)
  }
}

export function removeChild(kit: RenderKit, container: Element, child: Node): void {
  kit[RENDERER].removeChild(container, child)
}

export function setNodeValue(kit: RenderKit, node: Node, value: string): void {
  kit[RENDERER].setValue(node, value)
}
