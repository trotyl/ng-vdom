import { mount } from '../../src/instructions/mount'
import { patch } from '../../src/instructions/patch'
import { Component } from '../../src/shared/component'
import { createElement as h } from '../../src/shared/factory'
import { normalize as n } from '../../src/shared/node'
import { VNode } from '../../src/shared/types'
import { createClassComponentNode, createFunctionComponentNode, createNativeNode, createTextNode, createVoidNode, setUpContext, EMPTY_COMMENT } from '../util'

const TEXT_DEFAULT_CONTENT = 'foo'
const COMPOSITE_DEFAULT_CONTENT = '<p class="foo">42</p>'

describe('patch instruction', () => {
  let container: HTMLElement
  let previous: VNode
  let next: VNode

  setUpContext()

  beforeEach(() => {
    container = document.createElement('div')
    previous = null!
    next = null!
  })

  describe('in same type', () => {
    describe('Text', () => {
      beforeEach(() => {
        previous = createTextNode()
        mount(previous, container, null)
      })

      it('should change text content in same node', () => {
        next = createTextNode('bar')

        patch(previous, next, container)

        expect(next.native).toBe(previous.native)
        expect(container.contains(next.native)).toBe(true)
        expect(container.innerHTML).toBe(`bar`)
      })
    })

    describe('Void', () => {
      beforeEach(() => {
        previous = createVoidNode()
        mount(previous, container, null)
      })

      it('should change text content in same node', () => {
        next = createVoidNode()

        patch(previous, next, container)

        expect(next.native).toBe(previous.native)
        expect(container.contains(next.native)).toBe(true)
        expect(container.innerHTML).toBe(EMPTY_COMMENT)
      })
    })

    describe('Native', () => {
      beforeEach(() => {
        previous = createNativeNode()
        mount(previous, container, null)
      })

      it('should change property to different value', () => {
        next = createNativeNode(undefined, { className: 'bar' })

        patch(previous, next, container)

        expect(next.native).toBe(previous.native)
        expect(container.innerHTML).toBe('<p class="bar">42</p>')
      })

      it('should change to different property set', () => {
        next = createNativeNode(undefined, { title: 'bar' })

        patch(previous, next, container)

        expect(next.native).toBe(previous.native)
        expect(container.innerHTML).toBe('<p class="" title="bar">42</p>')
      })

      it('should change to different children', () => {
        next = createNativeNode(undefined, undefined, 84)

        patch(previous, next, container)

        expect(next.native).toBe(previous.native)
        expect(container.innerHTML).toBe('<p class="foo">84</p>')
      })

      it('should change to different tag name', () => {
        next = createNativeNode('span')

        patch(previous, next, container)

        expect(next.native).not.toBe(previous.native)
        expect(container.innerHTML).toBe('<span class="foo">42</span>')
      })
    })

    describe('Class Component', () => {
      it('should use new render result', () => {
        let className = 'foo'
        previous = next = createClassComponentNode(() => h('p', { className }, 42))
        mount(previous, container, null)

        className = 'bar'
        patch(previous, next, container)

        expect(next.native).toBe(previous.native)
        expect(container.innerHTML).toBe('<p class="bar">42</p>')
      })

      it('should change to different component', () => {
        previous = createClassComponentNode(() => 0)
        next = createClassComponentNode(() => 1)

        mount(previous, container, null)

        patch(previous, next, container)

        expect(next.native).not.toBe(previous.native)
        expect(container.innerHTML).toBe('1')
      })
    })

    describe('Function Component', () => {
      it('should use new result', () => {
        let className = 'foo'
        previous = next = n(h(() => h('p', { className }, 42)))
        mount(previous, container, null)

        className = 'bar'
        patch(previous, next, container)

        expect(next.native).toBe(previous.native)
        expect(container.innerHTML).toBe('<p class="bar">42</p>')
      })

      it('should change to different component', () => {
        previous = n(h(() => 0))
        next = n(h(() => 1))
        mount(previous, container, null)

        patch(previous, next, container)

        expect(next.native).not.toBe(previous.native)
        expect(container.innerHTML).toBe('1')
      })
    })
  })

  describe('in different type', () => {
    const types: Array<{ name: string, factory: () => VNode, html: string }> = [
      { name: 'Text', factory: createTextNode, html: TEXT_DEFAULT_CONTENT },
      { name: 'Void', factory: createVoidNode, html: EMPTY_COMMENT },
      { name: 'Native', factory: createNativeNode, html: COMPOSITE_DEFAULT_CONTENT },
      { name: 'Class Component', factory: createClassComponentNode, html: COMPOSITE_DEFAULT_CONTENT },
      { name: 'Function Component', factory: createFunctionComponentNode, html: COMPOSITE_DEFAULT_CONTENT },
    ]

    for (const previousType of types) {
      for (const nextType of types) {
        if (previousType === nextType) continue

        it(`should replace ${previousType.name} node with ${nextType.name} node`, () => {
          previous = previousType.factory()
          next = nextType.factory()
          mount(previous, container, null)

          patch(previous, next, container)

          expect(container.contains(next.native)).toBe(true)
          expect(container.contains(previous.native)).toBe(false)
          expect(container.innerHTML).toBe(nextType.html)
        })
      }
    }
  })
})
