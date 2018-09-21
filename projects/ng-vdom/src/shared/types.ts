import { getCurrentUpdateQueue } from './context'
import { isObject } from './lang'
import { VNode } from './types'

const EMPTY_OBJ = {}

export type Key = string | number

export interface Attributes {
  key?: Key
}

export interface ClassAttributes extends Attributes {
  ref?: any
}

export interface ErrorInfo {
  /**
   * Captures which component contained the exception, and its ancestors.
   */
  componentStack: string
}

export interface ComponentLifecycle<P = any, S = any> {
  /**
   * Called immediately after a component is mounted. Setting state here will trigger re-rendering.
   */
  componentDidMount?(): void

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
  shouldComponentUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): boolean

  /**
   * Called immediately before a component is destroyed. Perform any necessary cleanup in this method, such as
   * cancelled network requests, or cleaning up any DOM elements created in `componentDidMount`.
   */
  componentWillUnmount?(): void

  /**
   * Catches exceptions generated in descendant components. Unhandled exceptions will cause
   * the entire component tree to unmount.
   */
  componentDidCatch?(error: Error, errorInfo: ErrorInfo): void

  render(): any
}

/**
 * Base class helpers for the updating state of a component.
 */
export abstract class Component<P = any, S = any> implements ComponentLifecycle<P, S> {
  state!: S
  refs: { [key: string]: any } = EMPTY_OBJ

  get isComponent(): boolean { return true }

  constructor(readonly props: P, _context?: S) {}

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
  setState<K extends keyof S>(
    partialState: ((prevState: Readonly<S>, props: Readonly<P>) => (Pick<S, K> | S | null)) | (Pick<S, K> | S | null),
    callback?: () => void,
  ): void {
    getCurrentUpdateQueue().enqueueSetState(this, partialState, callback, 'setState')
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
    getCurrentUpdateQueue().enqueueForceUpdate(this, callback, 'forceUpdate')
  }

  abstract render(): VNode
}

/**
 * Convenience component with default shallow equality check for sCU.
 */
export abstract class PureComponent<P, S> extends Component<P, S> {
  get isPureComponent(): boolean { return true }
}

export interface ComponentClass<P = any> {
  new(props: P): Component<P>
}

export type StatelessComponent<P = any> = (props: P) => VNode

export type ComponentType<P = any> = ComponentClass<P> | StatelessComponent<P>

export interface VElement<P = any> {
  type: ComponentType<P> | string
  props: P
  children?: any[]
  key?: string | number
}

export type VText = string | number

export type VNode = VElement | VText

export interface ComponentElement<P = any> extends VElement<P> {
  type: ComponentType<P>
}

export interface NativeElement<P = any> extends VElement<P> {
  type: string
}

export function isVElement(element: VNode): element is VElement {
  return isObject(element) && ('type' in element)
}

export function isVText(element: VNode): element is VText {
  const type = typeof element
  return type === 'string' || type === 'number'
}

export function isNativeElement(element: VElement): element is NativeElement {
  return typeof element.type === 'string'
}

export function isComponentElement(element: VElement): element is ComponentElement {
  return typeof element.type === 'function'
}

export function isClassComponent(type: ComponentType): type is ComponentClass {
  return (type.prototype as any).isComponent
}

export function nodeTypeOf(node: VNode): any {
  if (isVElement(node)) {
    return node.type
  } else if (isVText(node)) {
    return '$$text'
  } else {
    throw new Error(`...`)
  }
}
