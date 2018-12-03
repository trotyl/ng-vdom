import { createChildrenDiffer } from '../shared/context'
import { VNodeFlags } from '../shared/flags'
import { isNullOrUndefined } from '../shared/lang'
import { normalize } from '../shared/node'
import { CHILDREN_DIFFER, COMPONENT_INSTANCE, FunctionComponentType, Properties, RENDER_RESULT, VNode } from '../shared/types'
import { insertByIndex, moveByIndex, removeByIndex } from './diff'
import { mount, mountChildren } from './mount'
import { patchProperties } from './property'
import { getCurrentMeta, setCurrentMeta } from './register'
import { removeChild, setNodeValue } from './render'
import { unmount } from './unmount'

export function patch(lastVNode: VNode, nextVNode: VNode, container: Element): void {
  const nextFlags = nextVNode.flags

  if (lastVNode.flags !== nextVNode.flags || lastVNode.type !== nextVNode.type || lastVNode.key !== nextVNode.key) {
    replaceWithNewNode(lastVNode, nextVNode, container)
  } else if (nextFlags & VNodeFlags.Native) {
    patchElement(lastVNode, nextVNode)
  } else if (nextFlags & VNodeFlags.ClassComponent) {
    patchClassComponent(lastVNode, nextVNode, container)
  } else if (nextFlags & VNodeFlags.FunctionComponent) {
    patchFunctionComponent(lastVNode, nextVNode, container)
  } else if (nextFlags & VNodeFlags.Text) {
    patchText(lastVNode, nextVNode)
  } else if (nextFlags & VNodeFlags.Void) {
    patchVoid(lastVNode, nextVNode)
  } else {
    throw new Error(`Unsupported node type ${nextVNode.type}`)
  }
}

function replaceWithNewNode(lastVNode: VNode, nextVNode: VNode, container: Element): void {
  const lastNode = lastVNode.native!
  unmount(lastVNode)
  mount(nextVNode, container, lastNode)
  removeChild(container, lastNode)
}

function patchElement(lastVNode: VNode, nextVNode: VNode): void {
  const meta = nextVNode.meta = lastVNode.meta!
  const previousMeta = setCurrentMeta(meta)

  const lastChildren = lastVNode.children!
  const lastProps = lastVNode.props
  const nextChildren = nextVNode.children!
  const nextProps = nextVNode.props as Properties

  const element = nextVNode.native = lastVNode.native! as Element

  if (lastProps !== nextProps) {
    patchProperties(element, nextProps)
  }
  if (lastChildren !== nextChildren) {
    patchChildren(lastChildren, nextChildren, element)
  }

  setCurrentMeta(previousMeta)
}

function patchClassComponent(lastVNode: VNode, nextVNode: VNode, container: Element): void {
  const meta = nextVNode.meta = lastVNode.meta!

  const instance = meta[COMPONENT_INSTANCE]!
  const lastResult = meta[RENDER_RESULT]!

  const props = nextVNode.props as Properties

  (instance as { props: Properties }).props = props
  const nextResult = meta[RENDER_RESULT] = normalize(instance!.render())

  patch(lastResult, nextResult, container)
  nextVNode.native = nextResult.native
}

function patchFunctionComponent(lastVNode: VNode, nextVNode: VNode, container: Element): void {
  const meta = nextVNode.meta = lastVNode.meta!

  const type = nextVNode.type as FunctionComponentType
  const props = nextVNode.props as Properties
  const lastInner = meta[RENDER_RESULT]!
  const nextInner = meta[RENDER_RESULT] = normalize(type(props))

  patch(lastInner, nextInner, container)
  nextVNode.native = nextInner.native
}

function patchText(lastVNode: VNode, nextVNode: VNode): void {
  nextVNode.native = lastVNode.native

  const lastText = (lastVNode.props as { textContent: string }).textContent
  const nextText = (nextVNode.props as { textContent: string }).textContent

  if (lastText === nextText) { return }

  setNodeValue(lastVNode.native!, nextText)
}

function patchVoid(lastVNode: VNode, nextVNode: VNode): void {
  nextVNode.native = lastVNode.native
}

function patchChildren(lastChildren: VNode[], nextChildren: VNode[], container: Element): void {
  const meta = getCurrentMeta()

  if (lastChildren.length === 0) {
    meta[CHILDREN_DIFFER] = null
    return mountChildren(nextChildren, container)
  }

  if (lastChildren.length === 1 && nextChildren.length === 1) {
    meta[CHILDREN_DIFFER] = null
    return patch(lastChildren[0], nextChildren[0], container)
  }

  const nodes = lastChildren.map(vNode => vNode.native!)
  const differ = meta[CHILDREN_DIFFER] = meta[CHILDREN_DIFFER] || createChildrenDiffer(lastChildren)
  const changes = differ.diff(nextChildren)

  if (!isNullOrUndefined(changes)) {
    changes.forEachOperation(({ item, previousIndex, currentIndex }, temporaryPreviousIndex, temporaryCurrentIndex) => {
      if (isNullOrUndefined(previousIndex)) {
        mount(item, null, null)
        insertByIndex(container, item.native!, temporaryCurrentIndex!, nodes)
      } else if (isNullOrUndefined(temporaryCurrentIndex)) {
        removeByIndex(container, temporaryPreviousIndex!, nodes)
      } else {
        moveByIndex(container, temporaryPreviousIndex!, temporaryCurrentIndex, nodes)
        patch(lastChildren[previousIndex], nextChildren[currentIndex!], container)
      }
    })

    changes.forEachIdentityChange(({ item, previousIndex }) => {
      patch(lastChildren[previousIndex!], item, container)
    })
  } else {
    for (let i = 0; i < nextChildren.length; i++) {
      patch(nextChildren[i], nextChildren[i], container)
    }
  }
}
