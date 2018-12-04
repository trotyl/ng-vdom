import { ElementRef, KeyValueChangeRecord, Type } from '@angular/core'
import { Observable, Subscription } from 'rxjs'
import { isNil } from '../shared/lang'
import { createEmptyMeta } from '../shared/node'
import { APPLICATION_REF, COMPONENT_FACTORY_RESOLVER, INJECTOR, RenderKit } from '../shared/render-kit'
import { ANGULAR_COMPONENT_INSTANCE, ANGULAR_INPUT_MAP, ANGULAR_OUTPUT_MAP, COMPONENT_REF, Properties, PROP_DIFFER, VNode } from '../shared/types'
import { insertBefore } from './render'
import { createPropDiffer, isEventLikeProp, parseEventName } from './util'

export function mountAngularComponent(kit: RenderKit, vNode: VNode, container: Element | null, nextNode: Node | null): void {
  const resolver = kit[COMPONENT_FACTORY_RESOLVER]
  const factory = resolver.resolveComponentFactory(vNode.type as Type<any>)
  const injector = kit[INJECTOR]

  const meta = vNode.meta = createEmptyMeta()
  meta[ANGULAR_INPUT_MAP] = makePropMap(factory.inputs)
  meta[ANGULAR_OUTPUT_MAP] = makePropMap(factory.outputs)
  // TODO: mount children as projectableNodes
  const ref = meta[COMPONENT_REF] = factory.create(injector)
  meta[ANGULAR_COMPONENT_INSTANCE] = ref.instance
  const app = kit[APPLICATION_REF]
  app.attachView(ref.hostView)
  patchProperties(kit, vNode, vNode.props)

  const element = vNode.native = ref.injector.get(ElementRef as Type<ElementRef>).nativeElement

  if (!isNil(container)) {
    insertBefore(kit, container, element, nextNode)
  }
}

export function patchAngularComponent(kit: RenderKit, lastVNode: VNode, nextVNode: VNode, container: Element): void {
  nextVNode.meta = lastVNode.meta!

  const lastProps = lastVNode.props
  const nextProps = nextVNode.props as Properties

  nextVNode.native = lastVNode.native! as Element

  if (lastProps !== nextProps) {
    patchProperties(kit, nextVNode, nextProps)
  }

  // TODO: add support for children
}

export function unmountAngularComponent(kit: RenderKit, vNode: VNode): void {
  const meta = vNode.meta!
  removeAllSubscriptions(meta[ANGULAR_COMPONENT_INSTANCE]!)
  const ref = meta[COMPONENT_REF]!
  ref.destroy()
}

function patchProperties(kit: RenderKit, vNode: VNode, props: Properties) {
  if (Object.keys(props).length === 0) { return }

  const meta = vNode.meta!
  let differ = meta[PROP_DIFFER]
  if (isNil(differ)) {
    differ = meta[PROP_DIFFER] = createPropDiffer(kit)
  }
  const changes = differ.diff(props)

  if (!isNil(changes)) {
    const applyPropertyChange = createPropertyChangeCallback(vNode)
    changes.forEachAddedItem(applyPropertyChange)
    changes.forEachChangedItem(applyPropertyChange)
    changes.forEachRemovedItem(applyPropertyChange)
  }
}

function setProperty(vNode: VNode, prop: string, value: unknown) {
  const meta = vNode.meta!
  const instance = meta[ANGULAR_COMPONENT_INSTANCE]!
  const inputs = meta[ANGULAR_INPUT_MAP]!
  const outputs = meta[ANGULAR_OUTPUT_MAP]!

  let propName: string
  if (propName = inputs[prop]) {
    const instanceForInputs = instance as { [key: string]: unknown }
    instanceForInputs[propName] = value
  } else if (isEventLikeProp(prop) && (propName = outputs[parseEventName(prop)])) {
    setupOutputHandler(instance, propName, value as EventListener)
  }
}

function createPropertyChangeCallback(vNode: VNode) {
  return ({ key, currentValue }: KeyValueChangeRecord<string, unknown>) => setProperty(vNode, key, currentValue)
}

function makePropMap(pairs: Array<{ propName: string, templateName: string }>): { [key: string]: string } {
  const res: { [key: string]: string } = {}

  for (let i = 0; i < pairs.length; i++) {
    const { templateName, propName } = pairs[i]
    res[templateName] = propName
  }

  return res
}

const SUBSCRIPTIONS_KEY = '__niro_subscriptions__'

interface Subscriptions {
  [key: string]: Subscription
}

function setupOutputHandler(instance: object, outputName: string, listener: EventListener): void {
  const subscriptions = getSubscriptions(instance)
  const subscription: Subscription | undefined = subscriptions[outputName]
  if (!isNil(subscription)) {
    subscription.unsubscribe()
  }
  const instanceForOutputs = instance as { [key: string]: Observable<any> }
  subscriptions[outputName] = instanceForOutputs[outputName].subscribe(listener)
}

function removeAllSubscriptions(instance: object): void {
  const subscriptions = getSubscriptions(instance)
  for (const outputName in subscriptions) {
    subscriptions[outputName].unsubscribe()
  }
}

function getSubscriptions(instance: object): Subscriptions {
  const untypedInstance = instance as { [key: string]: unknown }
  if (!untypedInstance[SUBSCRIPTIONS_KEY]) {
    untypedInstance[SUBSCRIPTIONS_KEY] = Object.create(null)
  }
  return untypedInstance[SUBSCRIPTIONS_KEY] as Subscriptions
}
