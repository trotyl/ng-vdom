import { mount } from '../instructions/mount'
import { patch } from '../instructions/patch'
import { destroy } from '../instructions/unmount'
import { Component } from '../shared/component'
import { isFunc } from '../shared/lang'
import { normalize } from '../shared/node'
import { setCurrentRenderKit, RenderKit } from '../shared/render-kit'
import { TaskScheduler } from '../shared/schedule'
import { NodeDef, StateChange, VNode } from '../shared/types'
import { UpdateQueue } from '../shared/update-queue'

export abstract class Container implements UpdateQueue {
  protected abstract __def: NodeDef | null
  protected abstract __container: Element
  protected abstract __scheduler: TaskScheduler

  private __lastDef: NodeDef | null = null
  private __vNode: VNode | null = null
  private __queue: Array<() => void> = []
  private __pendingSchedule: boolean = false

  enqueueForceUpdate(publicInstance: Component, callback?: (() => void) | undefined, callerName?: string | undefined): void {
    this.__detectChanges()

    if (callback != null) {
      callback()
    }
  }

  enqueueSetState<S, P>(instance: Component, partialState: StateChange<S, P>, callback?: (() => void)): void {
    // TODO: extract function declaration
    this.__queue.push(() => {
      if (isFunc(partialState)) {
        instance.state = partialState(instance.state, instance.props)
      } else {
        Object.assign(instance.state, partialState)
      }
    })

    if (!this.__pendingSchedule) {
      this.__pendingSchedule = true
      // TODO: extract function declaration
      this.__scheduler(() => {
        for (const fn of this.__queue) {
          fn()
        }
        this.__queue = []
        this.__pendingSchedule = false

        this.__detectChanges()

        if (callback != null) {
          callback()
        }
      })
    }
  }

  protected abstract __createRenderKit(): RenderKit

  protected __detectChanges(): void {
    const renderKit = this.__createRenderKit()
    const previous = setCurrentRenderKit(renderKit)

    if (this.__lastDef == null) {
      if (this.__def != null) {
        this.__vNode = normalize(this.__def)
        mount(renderKit, this.__vNode, this.__container, null)
      }
    } else {
      if (this.__def == null) {
        destroy(renderKit, this.__vNode!)
      } else if (this.__def !== this.__lastDef) {
        const lastVNode = this.__vNode!
        this.__vNode = normalize(this.__def)
        patch(renderKit, lastVNode, this.__vNode)
      }
    }

    this.__lastDef = this.__def

    setCurrentRenderKit(previous)
  }
}
