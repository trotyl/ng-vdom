import { Component as NgComponent, Injector, Input, NgModule, RendererFactory2 } from '@angular/core'
import { inject } from '@angular/core/testing'
import { Component } from '../src/shared/component'
import { setCurrentInjector, setCurrentRenderer, setCurrentUpdateQueue } from '../src/shared/context'
import { createElement as h } from '../src/shared/factory'
import { isFunction } from '../src/shared/lang'
import { normalize as n } from '../src/shared/node'
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


class ImediateUpdateQueue implements UpdateQueue {
  enqueueForceUpdate(publicInstance: Component, callback?: (() => void) | undefined, callerName?: string | undefined): void { }

  enqueueSetState<S, P>(publicInstance: Component, partialState: StateChange<S, P>, callback?: (() => void) | undefined, callerName?: string | undefined): void {
    if (isFunction(partialState)) {
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

  beforeAll(() => {
    setCurrentUpdateQueue(new ImediateUpdateQueue())
  })

  beforeEach(inject([Injector, RendererFactory2], (injector: Injector, rendererFactory: RendererFactory2) => {
    const previousInjector = setCurrentInjector(injector)
    const previousRenderer = setCurrentRenderer(rendererFactory.createRenderer(null, null))

    restoreContext = () => {
      setCurrentInjector(previousInjector)
      setCurrentRenderer(previousRenderer)
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
