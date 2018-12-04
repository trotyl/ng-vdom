import { ApplicationRef, Component as NgComponent, ComponentFactoryResolver, Injector, Input, IterableDiffers, KeyValueDiffers, NgModule, RendererFactory2 } from '@angular/core'
import { inject } from '@angular/core/testing'
import { Component } from '../src/shared/component'
import { createElement as h } from '../src/shared/factory'
import { isFunc } from '../src/shared/lang'
import { normalize as n } from '../src/shared/node'
import { setCurrentRenderKit } from '../src/shared/render-kit'
import { NodeDef, StateChange } from '../src/shared/types'
import { UpdateQueue } from '../src/shared/update-queue'

export const EMPTY_COMMENT = '<!---->'

export function isCommentNode(node: Node) {
  return node.nodeType === Node.COMMENT_NODE
}

export function createTextNode(content = 'foo') {
  return n(content)
}

export function createVoidNode() {
  return n(null)
}

export function createNativeNode(tag = 'p', props: object = { className: 'foo' }, children: NodeDef = 42) {
  return n(h(tag, props, children))
}

function defaultRender() {
  return h('p', { className: 'foo' }, 42)
}

export function createClassComponentNode(render: () => NodeDef = defaultRender) {

  class TestComponent extends Component {
    render = render
  }

  return n(h(TestComponent))
}

export function createFunctionComponentNode() {
  function NextComponent() {
    return h('p', { className: 'foo' }, 42)
  }

  return n(h(NextComponent))
}


class ImmediateUpdateQueue implements UpdateQueue {
  enqueueForceUpdate(publicInstance: Component, callback?: (() => void) | undefined, callerName?: string | undefined): void { }

  enqueueSetState<S, P>(publicInstance: Component, partialState: StateChange<S, P>, callback?: (() => void) | undefined, callerName?: string | undefined): void {
    if (isFunc(partialState)) {
      publicInstance.state = partialState(publicInstance.state, publicInstance.props)
    } else {
      publicInstance.state = Object.assign(publicInstance.state, partialState)
    }

    if (callback != null) {
      callback()
    }
  }
}

export function setUpContext(): void {
  let restoreContext: () => void

  beforeEach(inject([ApplicationRef, ComponentFactoryResolver, Injector, IterableDiffers, KeyValueDiffers, RendererFactory2], (app: ApplicationRef, cfr: ComponentFactoryResolver, inj: Injector, id: IterableDiffers, kd: KeyValueDiffers, rf: RendererFactory2) => {
    const hooks: Array<() => void> = []
    const r = rf.createRenderer(null, null)
    const queue = new ImmediateUpdateQueue()
    const previous = setCurrentRenderKit([app, cfr, inj, id, kd, hooks, r, queue])

    restoreContext = () => {
      setCurrentRenderKit(previous)
    }
  }))

  afterEach(() => {
    restoreContext()
  })
}

@NgComponent({
  template: `<p>{{value}}</p>`,
})
export class TestAngularComponent {
  @Input() value = 0
}

@NgModule({
  declarations: [ TestAngularComponent ],
  entryComponents: [ TestAngularComponent ],
})
export class TestModule { }
