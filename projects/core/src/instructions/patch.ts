import { VNodeFlags } from '../shared/flags'
import { isNil } from '../shared/lang'
import { normalize } from '../shared/node'
import { RenderKit } from '../shared/render-kit'
import { CHILD_DIFFER, COMPONENT_INSTANCE, FunctionComponentType, Properties, RENDER_RESULT, VNode } from '../shared/types'
import { insertByIndex, moveByIndex, removeByIndex } from './diff'
import { mount, mountChildren } from './mount'
import { patchProperties } from './property'
import { getCurrentMeta, setCurrentMeta } from './register'
import { removeChild, setNodeValue } from './render'
import { unmount } from './unmount'
import { createChildDiffer } from './util'

export function patch(kit: RenderKit, lastVNode: VNode, nextVNode: VNode, container: Element): void {
  const nextFlags = nextVNode.flags

  if (lastVNode.flags !== nextVNode.flags || lastVNode.type !== nextVNode.type || lastVNode.key !== nextVNode.key) {
    replaceWithNewNode(kit, lastVNode, nextVNode, container)
  } else if (nextFlags & VNodeFlags.Native) {
    patchElement(kit, lastVNode, nextVNode)
  } else if (nextFlags & VNodeFlags.ClassComponent) {
    patchClassComponent(kit, lastVNode, nextVNode, container)
  } else if (nextFlags & VNodeFlags.FunctionComponent) {
    patchFunctionComponent(kit, lastVNode, nextVNode, container)
  } else if (nextFlags & VNodeFlags.Text) {
    patchText(kit, lastVNode, nextVNode)
  } else if (nextFlags & VNodeFlags.Void) {
    patchVoid(kit, lastVNode, nextVNode)
  } else {
    throw new Error(`Unsupported node type ${nextVNode.type}`)
  }
}

function replaceWithNewNode(kit: RenderKit, lastVNode: VNode, nextVNode: VNode, container: Element): void {
  const lastNode = lastVNode.native!
  unmount(kit, lastVNode)
  mount(kit, nextVNode, container, lastNode)
  removeChild(kit, container, lastNode)
}

function patchElement(kit: RenderKit, lastVNode: VNode, nextVNode: VNode): void {
  const meta = nextVNode.meta = lastVNode.meta!
  const previousMeta = setCurrentMeta(meta)

  const lastChildren = lastVNode.children!
  const lastProps = lastVNode.props
  const nextChildren = nextVNode.children!
  const nextProps = nextVNode.props as Properties

  const element = nextVNode.native = lastVNode.native! as Element

  if (lastProps !== nextProps) {
    patchProperties(kit, element, nextProps)
  }
  if (lastChildren !== nextChildren) {
    patchChildren(kit, lastChildren, nextChildren, element)
  }

  setCurrentMeta(previousMeta)
}

function patchClassComponent(kit: RenderKit, lastVNode: VNode, nextVNode: VNode, container: Element): void {
  const meta = nextVNode.meta = lastVNode.meta!

  const instance = meta[COMPONENT_INSTANCE]!
  const lastResult = meta[RENDER_RESULT]!

  const props = nextVNode.props as Properties

  (instance as { props: Properties }).props = props
  const nextResult = meta[RENDER_RESULT] = normalize(instance!.render())

  patch(kit, lastResult, nextResult, container)
  nextVNode.native = nextResult.native
}

function patchFunctionComponent(kit: RenderKit, lastVNode: VNode, nextVNode: VNode, container: Element): void {
  const meta = nextVNode.meta = lastVNode.meta!

  const type = nextVNode.type as FunctionComponentType
  const props = nextVNode.props as Properties
  const lastInner = meta[RENDER_RESULT]!
  const nextInner = meta[RENDER_RESULT] = normalize(type(props))

  patch(kit, lastInner, nextInner, container)
  nextVNode.native = nextInner.native
}

function patchText(kit: RenderKit, lastVNode: VNode, nextVNode: VNode): void {
  nextVNode.native = lastVNode.native

  const lastText = (lastVNode.props as { textContent: string }).textContent
  const nextText = (nextVNode.props as { textContent: string }).textContent

  if (lastText === nextText) { return }

  setNodeValue(kit, lastVNode.native!, nextText)
}

function patchVoid(kit: RenderKit, lastVNode: VNode, nextVNode: VNode): void {
  nextVNode.native = lastVNode.native
}

function patchChildren(kit: RenderKit, lastChildren: VNode[], nextChildren: VNode[], container: Element): void {
  const meta = getCurrentMeta()

  if (lastChildren.length === 0) {
    delete meta[CHILD_DIFFER]
    return mountChildren(kit, nextChildren, container)
  }

  if (lastChildren.length === 1 && nextChildren.length === 1) {
    delete meta[CHILD_DIFFER]
    return patch(kit, lastChildren[0], nextChildren[0], container)
  }

  const nodes = lastChildren.map(vNode => vNode.native!)
  const differ = meta[CHILD_DIFFER] = meta[CHILD_DIFFER] || createChildDiffer(kit, lastChildren)
  const changes = differ.diff(nextChildren)

  if (!isNil(changes)) {
    changes.forEachOperation(({ item, previousIndex, currentIndex }, temporaryPreviousIndex, temporaryCurrentIndex) => {
      if (isNil(previousIndex)) {
        mount(kit, item, null, null)
        insertByIndex(kit, container, item.native!, temporaryCurrentIndex!, nodes)
      } else if (isNil(temporaryCurrentIndex)) {
        removeByIndex(kit, container, temporaryPreviousIndex!, nodes)
      } else {
        moveByIndex(kit, container, temporaryPreviousIndex!, temporaryCurrentIndex, nodes)
        patch(kit, lastChildren[previousIndex], nextChildren[currentIndex!], container)
      }
    })

    changes.forEachIdentityChange(({ item, previousIndex }) => {
      patch(kit, lastChildren[previousIndex!], item, container)
    })
  } else {
    for (let i = 0; i < nextChildren.length; i++) {
      patch(kit, nextChildren[i], nextChildren[i], container)
    }
  }
}
