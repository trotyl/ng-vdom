import { VNodeFlags } from '../shared/flags'
import { isNullOrUndefined, EMPTY_OBJ } from '../shared/lang'
import { normalize } from '../shared/node'
import { FunctionComponentType, Properties, VNode, VNodeMeta } from '../shared/types'
import { mount } from './mount'
import { insertByIndex, moveByIndex, removeByIndex, removeChild, replaceChild, setNodeValue } from './operation'
import { patchProperties } from './property'
import { getCurrentChildrenDiffer, setCurrentMeta } from './register'
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
  } else {
    throw new Error(`Unsupported node type ${nextVNode.type}`)
  }
}

function replaceWithNewNode(lastVNode: VNode, nextVNode: VNode, container: Element): void {
  const lastNode = lastVNode.native!
  unmount(lastVNode)

  if ((nextVNode.flags & lastVNode.flags & VNodeFlags.Simple) !== 0) {
    mount(nextVNode, null, null)
    replaceChild(container, nextVNode.native!, lastNode)
  } else {
    mount(nextVNode, container, lastNode)
    removeChild(container, lastNode)
  }
}

function patchElement(lastVNode: VNode, nextVNode: VNode): void {
  const meta = lastVNode.meta as VNodeMeta
  nextVNode.meta = meta

  const previousMeta = setCurrentMeta(meta)

  const lastChildren = lastVNode.children || []
  const lastProps = lastVNode.props
  const nextChildren = nextVNode.children || []
  const nextProps = nextVNode.props as Properties

  const element = lastVNode.native! as Element
  nextVNode.native = element

  if (lastProps !== nextProps) {
    patchProperties(element, nextProps)
  }
  patchChildren(lastChildren, nextChildren, element)

  setCurrentMeta(previousMeta)
}

function patchClassComponent(lastVNode: VNode, nextVNode: VNode, container: Element): void {
  const meta = lastVNode.meta as VNodeMeta
  nextVNode.meta = meta

  const previousMeta = setCurrentMeta(meta)

  const instance = lastVNode.meta!.$IS!
  const lastInner = lastVNode.meta!.$IN!

  const props = (nextVNode.props || EMPTY_OBJ) as Properties

  (instance as { props: Properties }).props = props
  const nextInner = normalize(instance!.render())
  nextVNode.meta!.$IN = nextInner

  patch(lastInner, nextInner, container)
  nextVNode.native = nextInner.native

  setCurrentMeta(previousMeta)
}

function patchFunctionComponent(lastVNode: VNode, nextVNode: VNode, container: Element): void {
  const meta = lastVNode.meta as VNodeMeta
  nextVNode.meta = meta

  const previousMeta = setCurrentMeta(meta)

  const type = nextVNode.type as FunctionComponentType
  const nextProps = (nextVNode.props || EMPTY_OBJ) as Properties
  const propertyDiffer = meta!.$PD!
  const lastInner = meta!.$IN!
  let nextInner = lastInner

  const changes = propertyDiffer!.diff(nextProps)

  if (!isNullOrUndefined(changes)) {
    nextInner = normalize(type(nextProps))
  }

  patch(lastInner, nextInner, container)
  nextVNode.native = nextInner.native

  setCurrentMeta(previousMeta)
}

function patchText(lastVNode: VNode, nextVNode: VNode): void {
  nextVNode.native = lastVNode.native

  const lastText = (lastVNode.props as { textContent: string }).textContent
  const nextText = (nextVNode.props as { textContent: string }).textContent

  if (lastText === nextText) { return }

  setNodeValue(lastVNode.native!, nextText)
}

function patchChildren(lastChildren: VNode[], nextChildren: VNode[], container: Element): void {
  const childDiffer = getCurrentChildrenDiffer()
  const nodes = lastChildren.map(vNode => vNode.native!)
  const changes = childDiffer.diff(nextChildren)

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
