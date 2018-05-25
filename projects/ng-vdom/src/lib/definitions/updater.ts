import { Component } from 'react'

export interface Updater {
  enqueueSetState<S>(instance: Component<any, S>, partialState: S, callback?: () => void): void
}
