import { Component } from 'react'
import { Updater } from '../definitions/updater'

export const noopUpdater: Updater = {
  enqueueSetState<S>(instance: Component<any, S>, partialState: S, callback?: () => void): void {
    console.warn(`NoopUpdater used.`)
  }
}
