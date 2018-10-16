import { Component } from './component'

export interface UpdateQueue {
  /**
   * Forces an update. This should only be invoked when it is known with
   * certainty that we are **not** in a DOM transaction.
   *
   * You may want to call this when you know that some deeper aspect of the
   * component's state has changed but `setState` was not called.
   *
   * This will not invoke `shouldComponentUpdate`, but it will invoke
   * `componentWillUpdate` and `componentDidUpdate`.
   *
   * @param publicInstance The instance that should rerender.
   * @param callback Called after component is updated.
   * @param callerName Name of the calling function in the public API.
   */
  enqueueForceUpdate(publicInstance: Component, callback?: () => void, callerName?: string): void

  /**
   * Sets a subset of the state. This only exists because _pendingState is
   * internal. This provides a merging strategy that is not available to deep
   * properties which is confusing. TODO: Expose pendingState or don't use it
   * during the merge.
   *
   * @param publicInstance The instance that should rerender.
   * @param partialState Next partial state to be merged with state.
   * @param callback Called after component is updated.
   * @param callerName Name of the calling function in the public API.
   */
  enqueueSetState(publicInstance: Component, partialState: any, callback?: () => void, callerName?: string): void
}
