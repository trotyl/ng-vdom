import { async, TestBed } from '@angular/core/testing'
import { mount } from '../../src/instructions/mount'
import { patch } from '../../src/instructions/patch'
import { createElement as h } from '../../src/shared/factory'
import { normalize as n } from '../../src/shared/node'
import { getCurrentRenderKit, RenderKit } from '../../src/shared/render-kit'
import { COMPONENT_REF, VNode } from '../../src/shared/types'
import { createClassComponentNode, createFunctionComponentNode, createNativeNode, createTextNode, createVoidNode, setUpContext, EMPTY_COMMENT, TestAngularContent, TestAngularProps, TestModule } from '../util'

const TEXT_DEFAULT_CONTENT = 'foo'
const COMPOSITE_DEFAULT_CONTENT = '<p class="foo">42</p>'

describe('patch instruction', () => {
  let container: HTMLElement
  let previous: VNode
  let next: VNode
  let kit: RenderKit

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ TestModule ],
    }).compileComponents()
  }))

  setUpContext()

  beforeEach(() => {
    container = document.createElement('div')
    previous = null!
    next = null!
    kit = getCurrentRenderKit()!
  })

  describe('in same type', () => {
    describe('Text', () => {
      beforeEach(() => {
        previous = createTextNode()
        mount(kit, previous, container, null)
      })

      it('should change text content in same node', () => {
        next = createTextNode('bar')

        patch(kit, previous, next)

        expect(next.native).toBe(previous.native)
        expect(container.contains(next.native)).toBe(true)
        expect(container.innerHTML).toBe(`bar`)
      })
    })

    describe('Void', () => {
      beforeEach(() => {
        previous = createVoidNode()
        mount(kit, previous, container, null)
      })

      it('should change text content in same node', () => {
        next = createVoidNode()

        patch(kit, previous, next)

        expect(next.native).toBe(previous.native)
        expect(container.contains(next.native)).toBe(true)
        expect(container.innerHTML).toBe(EMPTY_COMMENT)
      })
    })

    describe('Native', () => {
      beforeEach(() => {
        previous = createNativeNode()
        mount(kit, previous, container, null)
      })

      it('should change property to different value', () => {
        next = createNativeNode(undefined, { className: 'bar' })

        patch(kit, previous, next)

        expect(next.native).toBe(previous.native)
        expect(container.innerHTML).toBe('<p class="bar">42</p>')
      })

      it('should change to different property set', () => {
        next = createNativeNode(undefined, { title: 'bar' })

        patch(kit, previous, next)

        expect(next.native).toBe(previous.native)
        expect(container.innerHTML).toBe('<p class="" title="bar">42</p>')
      })

      it('should change to different children', () => {
        next = createNativeNode(undefined, undefined, 84)

        patch(kit, previous, next)

        expect(next.native).toBe(previous.native)
        expect(container.innerHTML).toBe('<p class="foo">84</p>')
      })

      it('should change to different tag name', () => {
        next = createNativeNode('span')

        patch(kit, previous, next)

        expect(next.native).not.toBe(previous.native)
        expect(container.innerHTML).toBe('<span class="foo">42</span>')
      })
    })

    describe('Class Component', () => {
      it('should use new render result', () => {
        let className = 'foo'
        previous = next = createClassComponentNode(() => h('p', { className }, 42))
        mount(kit, previous, container, null)

        className = 'bar'
        patch(kit, previous, next)

        expect(next.native).toBe(previous.native)
        expect(container.innerHTML).toBe('<p class="bar">42</p>')
      })

      it('should change to different component', () => {
        previous = createClassComponentNode(() => 0)
        next = createClassComponentNode(() => 1)

        mount(kit, previous, container, null)

        patch(kit, previous, next)

        expect(next.native).not.toBe(previous.native)
        expect(container.innerHTML).toBe('1')
      })
    })

    describe('Function Component', () => {
      it('should use new result', () => {
        let className = 'foo'
        previous = next = n(h(() => h('p', { className }, 42)))
        mount(kit, previous, container, null)

        className = 'bar'
        patch(kit, previous, next)

        expect(next.native).toBe(previous.native)
        expect(container.innerHTML).toBe('<p class="bar">42</p>')
      })

      it('should change to different component', () => {
        previous = n(h(() => 0))
        next = n(h(() => 1))
        mount(kit, previous, container, null)

        patch(kit, previous, next)

        expect(next.native).not.toBe(previous.native)
        expect(container.innerHTML).toBe('1')
      })
    })

    describe('Angular Component', () => {
      it('should apply input change', () => {
        previous = n(h(TestAngularProps, { value: 42 }))
        next = n(h(TestAngularProps, { value: 84 }))
        mount(kit, previous, container, null)

        patch(kit, previous, next)

        expect(next.native).toBe(previous.native)
        expect(container.innerHTML).toBe(`<ng-component><p>84</p></ng-component>`)
      })

      it('should apply output change', () => {
        let component: TestAngularProps
        const logs: number[] = []
        previous = n(h(TestAngularProps, { onChanges: (value: number) => logs.push(value) }))
        next = n(h(TestAngularProps, { onChanges: (value: number) => logs.push(-value) }))

        mount(kit, previous, container, null)
        component = (previous.meta![COMPONENT_REF]!.instance as TestAngularProps)
        component.changes.emit(1)

        patch(kit, previous, next)
        component = (next.meta![COMPONENT_REF]!.instance as TestAngularProps)
        component.changes.emit(2)

        expect(logs).toEqual([1, -2])
      })

      it('should apply content change', () => {
        previous = n(h(TestAngularContent, null, 42))
        next = n(h(TestAngularContent, null, 84))
        mount(kit, previous, container, null)

        patch(kit, previous, next)

        expect(next.native).toBe(previous.native)
        expect(container.innerHTML).toBe(`<ng-component><div>84<!----></div></ng-component>`)
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
          mount(kit, previous, container, null)

          patch(kit, previous, next)

          expect(container.contains(next.native)).toBe(true)
          expect(container.contains(previous.native)).toBe(false)
          expect(container.innerHTML).toBe(nextType.html)
        })
      }
    }
  })
})
