import { getCurrentUpdateQueue } from './context'
import { EMPTY_OBJ } from './lang'
import { ComponentLifecycle } from './lifecycle'
import { NodeDef, StateChange } from './types'
import { UpdateQueue } from './update-queue'

/**
 * Base class helpers for the updating state of a component.
 */
export abstract class Component<P = any, S = any> implements ComponentLifecycle<P, S> {
  state!: S
  refs: { [key: string]: unknown } = EMPTY_OBJ
  updateQueue: UpdateQueue = getCurrentUpdateQueue()

  get isComponent(): boolean { return true }

  constructor(readonly props: P) {}

  /**
   * Sets a subset of the state. Always use this to mutate
   * state. You should treat `this.state` as immutable.
   *
   * There is no guarantee that `this.state` will be immediately updated, so
   * accessing `this.state` after calling this method may return the old value.
   *
   * There is no guarantee that calls to `setState` will run synchronously,
   * as they may eventually be batched together.  You can provide an optional
   * callback that will be executed when the call to setState is actually
   * completed.
   *
   * When a function is provided to setState, it will be called at some point in
   * the future (not synchronously). It will be called with the up to date
   * component arguments (state, props, context). These values can be different
   * from this.* because your function may be called after receiveProps but before
   * shouldComponentUpdate, and this new state, props, and context will not yet be
   * assigned to this.
   *
   * @param partialState Next partial state or function to
   *        produce next partial state to be merged with current state.
   * @param callback Called after state is updated.
   */
  setState(partialState: StateChange<S, P>, callback?: () => void): void {
    this.updateQueue.enqueueSetState(this, partialState, callback, 'setState')
  }

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
   * @param callback Called after update is complete.
   */
  forceUpdate(callback?: () => void) {
    this.updateQueue.enqueueForceUpdate(this, callback, 'forceUpdate')
  }

  abstract render(): NodeDef
}

/**
 * Convenience component with default shallow equality check for sCU.
 */
export abstract class PureComponent<P = any, S = any> extends Component<P, S> {
  get isPureComponent(): boolean { return true }
}
