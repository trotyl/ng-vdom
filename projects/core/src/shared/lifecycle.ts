import { Component } from './component'
import { ErrorInfo } from './error'
import { NodeDef } from './types'

export interface ComponentLifecycle<P = any, S = any> {
  /**
   * Called immediately after a component is mounted. Setting state here will trigger re-rendering.
   */
  componentDidMount(): void

  /**
   * Called to determine whether the change in props and state should trigger a re-render.
   *
   * `Component` always returns true.
   * `PureComponent` implements a shallow comparison on props and state and returns true if any
   * props or states have changed.
   *
   * If false is returned, `Component#render`, `componentWillUpdate`
   * and `componentDidUpdate` will not be called.
   */
  shouldComponentUpdate(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: unknown): boolean

  /**
   * Called immediately before a component is destroyed. Perform any necessary cleanup in this method, such as
   * cancelled network requests, or cleaning up any DOM elements created in `componentDidMount`.
   */
  componentWillUnmount(): void

  /**
   * Catches exceptions generated in descendant components. Unhandled exceptions will cause
   * the entire component tree to unmount.
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void

  render(): NodeDef
}

export type LifecycleHooks = Array<Component | (() => void)>
