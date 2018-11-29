import { Component as NgComponent, Input, NgModule } from '@angular/core'
import { async, TestBed } from '@angular/core/testing'
import { mount } from '../../src/instructions/mount'
import { Component } from '../../src/shared/component'
import { createElement as h } from '../../src/shared/factory'
import { normalize as n } from '../../src/shared/node'
import { VNode } from '../../src/shared/types'
import { isCommentNode, setUpContext, EMPTY_COMMENT, TestAngularComponent, TestModule } from '../util'

describe('mount instruction', () => {
  let container: HTMLElement
  let input: VNode

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ TestModule ],
    }).compileComponents()
  }))

  setUpContext()

  beforeEach(() => {
    container = document.createElement('div')
  })

  describe('Text', () => {
    it('should mount without container', () => {
      input = n('foo')

      mount(input, null, null)

      expect(input.native).not.toBeNull()
      expect(input.native!.textContent).toBe(`foo`)
    })

    it('should mount text node in string', () => {
      input = n('foo')
      mount(input, container, null)

      expect(input.native).not.toBeNull()
      expect(container.innerHTML).toBe(`foo`)
    })

    it('should mount text node in number', () => {
      input = n(42)
      mount(input, container, null)

      expect(input.native).not.toBeNull()
      expect(container.innerHTML).toBe(`42`)
    })
  })

  describe('Void', () => {
    it('should mount without container', () => {
      input = n(null)

      mount(input, null, null)

      expect(isCommentNode(input.native!)).toBe(true)
    })

    it('should mount nothing in true', () => {
      input = n(true)
      mount(input, container, null)

      expect(input.native).not.toBeNull()
      expect(container.innerHTML).toBe(EMPTY_COMMENT)
    })

    it('should mount nothing in false', () => {
      input = n(false)
      mount(input, container, null)

      expect(input.native).not.toBeNull()
      expect(container.innerHTML).toBe(EMPTY_COMMENT)
    })

    it('should mount nothing in null', () => {
      input = n(null)
      mount(input, container, null)

      expect(input.native).not.toBeNull()
      expect(container.innerHTML).toBe(EMPTY_COMMENT)
    })

    it('should mount nothing in undefined', () => {
      input = n(undefined)
      mount(input, container, null)

      expect(input.native).not.toBeNull()
      expect(container.innerHTML).toBe(EMPTY_COMMENT)
    })
  })

  describe('Native', () => {
    it('should mount without container', () => {
      input = n(h('p'))

      mount(input, null, null)

      expect(input.native).not.toBeNull()
      expect((input.native! as HTMLElement).tagName.toLowerCase()).toBe(`p`)
    })

    it('should mount basic element', () => {
      input = n(h('p'))
      mount(input, container, null)

      expect(input.native).not.toBeNull()
      expect(container.innerHTML).toBe(`<p></p>`)
    })

    describe('Property', () => {
      it('should mount element with property', () => {
        input = n(h('p', { className: 'foo' }))
        mount(input, container, null)

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
          mount(input, container, null)

          input.native!.dispatchEvent(new CustomEvent('foo'))

          expect(handled).toBe(true)
        })

        it('should add camelCase event listener', () => {
          input = n(h('p', { onFooBar: () => { handled = true } }))
          mount(input, container, null)

          input.native!.dispatchEvent(new CustomEvent('fooBar'))

          expect(handled).toBe(true)
        })

        it('should add PascalCase event listener', () => {
          input = n(h('p', { on_FooBar: () => { handled = true } }))
          mount(input, container, null)

          input.native!.dispatchEvent(new CustomEvent('FooBar'))

          expect(handled).toBe(true)
        })

        it('should add kebab-case event listener', () => {
          input = n(h('p', { 'on_foo-bar': () => { handled = true } }))
          mount(input, container, null)

          input.native!.dispatchEvent(new CustomEvent('foo-bar'))

          expect(handled).toBe(true)
        })

        it('should add uppercase event listener', () => {
          input = n(h('p', { on_FOOBAR: () => { handled = true } }))
          mount(input, container, null)

          input.native!.dispatchEvent(new CustomEvent('FOOBAR'))

          expect(handled).toBe(true)
        })
      })
    })

    describe('Child', () => {
      it('should mount element with text child', () => {
        input = n(h('p', null, 'foo'))
        mount(input, container, null)

        expect(input.native).not.toBeNull()
        expect(container.innerHTML).toBe(`<p>foo</p>`)
      })

      it('should mount element with element child', () => {
        input = n(h('p', null, h('span')))
        mount(input, container, null)

        expect(input.native).not.toBeNull()
        expect(container.innerHTML).toBe(`<p><span></span></p>`)
      })

      it('should mount element with multiple children', () => {
        input = n(h('p', null, 0, h('span', null, 1), 2, h('b', null, 3), 4))
        mount(input, container, null)

        expect(input.native).not.toBeNull()
        expect(container.innerHTML).toBe(`<p>0<span>1</span>2<b>3</b>4</p>`)
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

      mount(input, null, null)

      expect(input.native).not.toBeNull()
      expect((input.native! as HTMLElement).tagName.toLowerCase()).toBe('p')
    })

    it('should mount basic class component', () => {
      input = n(h(BasicComponent))
      mount(input, container, null)

      expect(input.native).not.toBeNull()
      expect(container.innerHTML).toBe(`<p></p>`)
    })

    it('should mount class component with property', () => {
      input = n(h(PropsComponent, { value: 42 }))
      mount(input, container, null)

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

      mount(input, null, null)

      expect(input.native).not.toBeNull()
      expect((input.native! as HTMLElement).tagName.toLowerCase()).toBe('p')
    })

    it('should mount basic function component', () => {
      input = n(h(BasicComponent))
      mount(input, container, null)

      expect(input.native).not.toBeNull()
      expect(container.innerHTML).toBe(`<p></p>`)
    })

    it('should mount class component with property', () => {
      input = n(h(PropsComponent, { value: 42 }))
      mount(input, container, null)

      expect(input.native).not.toBeNull()
      expect(container.innerHTML).toBe(`<p>42</p>`)
    })
  })

  describe('Angular Component', () => {
    it('should mount without container', () => {
      input = n(h(TestAngularComponent))

      mount(input, null, null)
      input.meta!.$CR!.changeDetectorRef.detectChanges()

      expect(input.native).not.toBeNull()
      expect((input.native! as HTMLElement).tagName.toLowerCase()).toBe('ng-component')
    })

    it('should mount class component with inputs', () => {
      input = n(h(TestAngularComponent, { value: 42 }))

      mount(input, container, null)
      input.meta!.$CR!.changeDetectorRef.detectChanges()

      expect(input.native).not.toBeNull()
      expect(container.innerHTML).toBe(`<ng-component><p>42</p></ng-component>`)
    })
  })

  describe('Other', () => {
    it('should report error for unsupported type', () => {
      expect(() => mount(n(h({} as any)), container, null)).toThrowError(/Unsupported node type:/)
    })
  })
})
