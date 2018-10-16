import { mount } from '../instructions/mount'
import { patch } from '../instructions/patch'
import { unmount } from '../instructions/unmount'
import { Component } from '../shared/component'
import { getCurrentScheduler, resetLifeCycle, runLifeCycle, setCurrentUpdateQueue } from '../shared/context'
import { isFunction } from '../shared/lang'
import { VNode } from '../shared/node'
import { TaskScheduler } from '../shared/schedule'
import { UpdateQueue } from '../shared/update-queue'

function noop() { }

export abstract class Container implements UpdateQueue {
  protected __def: VNode | null = null
  protected __container: HTMLElement | null = null

  private __lastDef: VNode | null = null
  private __node: Node | null = null
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

    if (this.__lastDef == null) {
      if (this.__def != null) {
        this.__node = mount(this.__def, this.__container)
      }
    } else {
      if (this.__def == null) {
        this.__node = unmount(this.__lastDef, this.__node!)
      } else if (this.__def !== this.__lastDef) {
        this.__node = patch(this.__lastDef, this.__def, this.__node!, this.__container!)
      }
    }

    runLifeCycle()
    this.__lastDef = this.__def
    setCurrentUpdateQueue(previousUpdateQueue)
    restoreContext()
  }

  protected __switchContext(): () => void {
    return noop
  }
}
