import { mount } from '../instructions/mount'
import { patch } from '../instructions/patch'
import { unmount } from '../instructions/unmount'
import { Component } from '../shared/component'
import { getCurrentScheduler, resetLifeCycle, runLifeCycle, setCurrentUpdateQueue } from '../shared/context'
import { isFunction, isNullOrUndefined } from '../shared/lang'
import { normalize } from '../shared/node'
import { TaskScheduler } from '../shared/schedule'
import { NodeDef, VNode } from '../shared/types'
import { UpdateQueue } from '../shared/update-queue'

function noop() { }

export abstract class Container implements UpdateQueue {
  protected __def: NodeDef | null = null
  protected __container: HTMLElement | null = null

  private __lastDef: NodeDef | null = null
  private __vNode: VNode | null = null
  private __queue: Array<() => void> = []
  private __pendingSchedule: boolean = false
  private __scheduler: TaskScheduler = getCurrentScheduler()

  enqueueForceUpdate(publicInstance: object, callback?: (() => void) | undefined, callerName?: string | undefined): void {
    this.__detectChanges()

    if (callback != null) {
      callback()
    }
  }

  enqueueSetState<S>(instance: Component, partialState: S, callback?: (() => void)): void {
    this.__queue.push(() => {
      if (isFunction(partialState)) {
        partialState = partialState(instance.state)
      }
      Object.assign(instance.state, partialState)
    })

    if (!this.__pendingSchedule) {
      this.__pendingSchedule = true
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

  protected __detectChanges(): void {
    const restoreContext = this.__switchContext()
    resetLifeCycle()
    const previousUpdateQueue = setCurrentUpdateQueue(this)

    if (isNullOrUndefined(this.__lastDef)) {
      if (!isNullOrUndefined(this.__def)) {
        this.__vNode = normalize(this.__def)
        mount(this.__vNode, this.__container, null)
      }
    } else {
      if (isNullOrUndefined(this.__def)) {
        unmount(this.__vNode!)
      } else if (this.__def !== this.__lastDef) {
        const lastVNode = this.__vNode!
        this.__vNode = normalize(this.__def)
        patch(lastVNode, this.__vNode, this.__container!)
      }
    }

    this.__lastDef = this.__def

    runLifeCycle()
    setCurrentUpdateQueue(previousUpdateQueue)
    restoreContext()
  }

  protected __switchContext(): () => void {
    return noop
  }
}
