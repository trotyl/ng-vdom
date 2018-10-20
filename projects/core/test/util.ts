import { IterableDiffers, KeyValueDiffers, RendererFactory2 } from '@angular/core'
import { inject } from '@angular/core/testing'
import { Component } from '../src/shared/component'
import { setCurrentIterableDiffers, setCurrentKeyValueDiffers, setCurrentRenderer, setCurrentUpdateQueue } from '../src/shared/context'
import { isFunction } from '../src/shared/lang'
import { StateChange } from '../src/shared/types'
import { UpdateQueue } from '../src/shared/update-queue'

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

  beforeEach(inject([RendererFactory2, IterableDiffers, KeyValueDiffers], (rendererFactory: RendererFactory2, iDiffers: IterableDiffers, kDiffers: KeyValueDiffers) => {
    const previousRenderer = setCurrentRenderer(rendererFactory.createRenderer(null, null))
    const previousIDiffers = setCurrentIterableDiffers(iDiffers)
    const previousKDiffers = setCurrentKeyValueDiffers(kDiffers)

    restoreContext = () => {
      setCurrentRenderer(previousRenderer)
      setCurrentIterableDiffers(previousIDiffers)
      setCurrentKeyValueDiffers(previousKDiffers)
    }
  }))

  afterEach(() => {
    restoreContext()
  })
}
