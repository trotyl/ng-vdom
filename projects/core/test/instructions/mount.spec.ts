import { async, TestBed } from '@angular/core/testing'
import { mount } from '../../src/instructions/mount'
import { Component } from '../../src/shared/component'
import { createElement as h } from '../../src/shared/factory'
import { normalize as n } from '../../src/shared/node'
import { getCurrentRenderKit, RenderKit } from '../../src/shared/render-kit'
import { COMPONENT_REF, VNode } from '../../src/shared/types'
import { isCommentNode, setUpContext, EMPTY_COMMENT, TestAngularContent, TestAngularProps, TestModule } from '../util'

describe('mount instruction', () => {
  let container: HTMLElement
  let input: VNode
  let kit: RenderKit

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ TestModule ],
    }).compileComponents()
  }))

  setUpContext()

  beforeEach(() => {
    container = document.createElement('div')
    kit = getCurrentRenderKit()!
  })

  describe('Text', () => {
    it('should mount without container', () => {
      input = n('foo')

      mount(kit, input, null, null)

      expect(input.native).not.toBeNull()
      expect(input.native!.textContent).toBe(`foo`)
    })

    it('should mount in string', () => {
      input = n('foo')
      mount(kit, input, container, null)

      expect(input.native).not.toBeNull()
      expect(container.innerHTML).toBe(`foo`)
    })

    it('should mount in number', () => {
      input = n(42)
      mount(kit, input, container, null)

      expect(input.native).not.toBeNull()
      expect(container.innerHTML).toBe(`42`)
    })
  })

  describe('Void', () => {
    it('should mount without container', () => {
      input = n(null)

      mount(kit, input, null, null)

      expect(isCommentNode(input.native!)).toBe(true)
    })

    it('should mount nothing in true', () => {
      input = n(true)
      mount(kit, input, container, null)

      expect(input.native).not.toBeNull()
      expect(container.innerHTML).toBe(EMPTY_COMMENT)
    })

    it('should mount nothing in false', () => {
      input = n(false)
      mount(kit, input, container, null)

      expect(input.native).not.toBeNull()
      expect(container.innerHTML).toBe(EMPTY_COMMENT)
    })

    it('should mount nothing in null', () => {
      input = n(null)
      mount(kit, input, container, null)

      expect(input.native).not.toBeNull()
      expect(container.innerHTML).toBe(EMPTY_COMMENT)
    })

    it('should mount nothing in undefined', () => {
      input = n(undefined)
      mount(kit, input, container, null)

      expect(input.native).not.toBeNull()
      expect(container.innerHTML).toBe(EMPTY_COMMENT)
    })
  })

  describe('Native', () => {
    it('should mount without container', () => {
      input = n(h('p'))

      mount(kit, input, null, null)

      expect(input.native).not.toBeNull()
      expect((input.native! as HTMLElement).tagName.toLowerCase()).toBe(`p`)
    })

    it('should mount basic element', () => {
      input = n(h('p'))
      mount(kit, input, container, null)

      expect(input.native).not.toBeNull()
      expect(container.innerHTML).toBe(`<p></p>`)
    })

    describe('Property', () => {
      it('should mount with property', () => {
        input = n(h('p', { className: 'foo' }))
        mount(kit, input, container, null)

        expect(input.native).not.toBeNull()
        expect(container.innerHTML).toBe(`<p class="foo"></p>`)
      })

      describe('Event', () => {
        let handled: boolean

        beforeEach(() => {
          handled = false
        })

        it('should add lowercase event listener', () => {
          input = n(h('p', { onFoo: () => { handled = true } }))
          mount(kit, input, container, null)

          input.native!.dispatchEvent(new CustomEvent('foo'))

          expect(handled).toBe(true)
        })

        it('should add camelCase event listener', () => {
          input = n(h('p', { onFooBar: () => { handled = true } }))
          mount(kit, input, container, null)

          input.native!.dispatchEvent(new CustomEvent('fooBar'))

          expect(handled).toBe(true)
        })

        it('should add PascalCase event listener', () => {
          input = n(h('p', { on_FooBar: () => { handled = true } }))
          mount(kit, input, container, null)

          input.native!.dispatchEvent(new CustomEvent('FooBar'))

          expect(handled).toBe(true)
        })

        it('should add kebab-case event listener', () => {
          input = n(h('p', { 'on_foo-bar': () => { handled = true } }))
          mount(kit, input, container, null)

          input.native!.dispatchEvent(new CustomEvent('foo-bar'))

          expect(handled).toBe(true)
        })

        it('should add uppercase event listener', () => {
          input = n(h('p', { on_FOOBAR: () => { handled = true } }))
          mount(kit, input, container, null)

          input.native!.dispatchEvent(new CustomEvent('FOOBAR'))

          expect(handled).toBe(true)
        })
      })
    })

    describe('Child', () => {
      it('should mount with text child', () => {
        input = n(h('p', null, 'foo'))
        mount(kit, input, container, null)

        expect(input.native).not.toBeNull()
        expect(container.innerHTML).toBe(`<p>foo</p>`)
      })

      it('should mount with element child', () => {
        input = n(h('p', null, h('span')))
        mount(kit, input, container, null)

        expect(input.native).not.toBeNull()
        expect(container.innerHTML).toBe(`<p><span></span></p>`)
      })

      it('should mount with multiple children', () => {
        input = n(h('p', null, 0, h('span', null, 1), 2, h('b', null, 3), 4))
        mount(kit, input, container, null)

        expect(input.native).not.toBeNull()
        expect(container.innerHTML).toBe(`<p>0<span>1</span>2<b>3</b>4</p>`)
      })

      it('should mount with nested children', () => {
        input = n(h('p', null, [1, 2, 3], [4, 5, 6]))
        mount(kit, input, container, null)

        expect(input.native).not.toBeNull()
        expect(container.innerHTML).toBe(`<p>123456</p>`)
      })
    })
  })

  describe('Class Component', () => {
    class BasicComponent extends Component {
      render() { return h('p') }
    }

    class PropsComponent extends Component<{ value: number }> {
      render() { return h('p', null, this.props.value) }
    }

    it('should mount without container', () => {
      input = n(h(BasicComponent))

      mount(kit, input, null, null)

      expect(input.native).not.toBeNull()
      expect((input.native! as HTMLElement).tagName.toLowerCase()).toBe('p')
    })

    it('should mount basic class component', () => {
      input = n(h(BasicComponent))
      mount(kit, input, container, null)

      expect(input.native).not.toBeNull()
      expect(container.innerHTML).toBe(`<p></p>`)
    })

    it('should mount with property', () => {
      input = n(h(PropsComponent, { value: 42 }))
      mount(kit, input, container, null)

      expect(input.native).not.toBeNull()
      expect(container.innerHTML).toBe(`<p>42</p>`)
    })
  })

  describe('Function Component', () => {
    function BasicComponent() {
      return h('p')
    }

    function PropsComponent(props: { value: number }) {
      return h('p', null, props.value)
    }

    it('should mount without container', () => {
      input = n(h(BasicComponent))

      mount(kit, input, null, null)

      expect(input.native).not.toBeNull()
      expect((input.native! as HTMLElement).tagName.toLowerCase()).toBe('p')
    })

    it('should mount basic function component', () => {
      input = n(h(BasicComponent))
      mount(kit, input, container, null)

      expect(input.native).not.toBeNull()
      expect(container.innerHTML).toBe(`<p></p>`)
    })

    it('should mount with property', () => {
      input = n(h(PropsComponent, { value: 42 }))
      mount(kit, input, container, null)

      expect(input.native).not.toBeNull()
      expect(container.innerHTML).toBe(`<p>42</p>`)
    })
  })

  describe('Angular Component', () => {
    it('should mount without container', () => {
      input = n(h(TestAngularProps))

      mount(kit, input, null, null)
      input.meta![COMPONENT_REF]!.changeDetectorRef.detectChanges()

      expect(input.native).not.toBeNull()
      expect((input.native! as HTMLElement).tagName.toLowerCase()).toBe('ng-component')
    })

    it('should mount with inputs', () => {
      input = n(h(TestAngularProps, { value: 42 }))

      mount(kit, input, container, null)

      expect(input.native).not.toBeNull()
      expect(container.innerHTML).toBe(`<ng-component><p>42</p></ng-component>`)
    })

    it('should mount with outputs', () => {
      let flag = false
      input = n(h(TestAngularProps, { onChanges: (value: boolean) => flag = value }))

      mount(kit, input, container, null)
      const component = (input.meta![COMPONENT_REF]!.instance as TestAngularProps)
      component.changes.emit(true)

      expect(flag).toBe(true)
    })

    it('should mount with content', () => {
      input = n(h(TestAngularContent, null, 42))

      mount(kit, input, container, null)

      expect(input.native).not.toBeNull()
      expect(container.innerHTML).toBe(`<ng-component><div>42<!----></div></ng-component>`)
    })
  })

  describe('Other', () => {
    it('should report error for unsupported type', () => {
      expect(() => mount(kit, n(h({} as any)), container, null)).toThrowError(/Unsupported node type:/)
    })
  })
})
