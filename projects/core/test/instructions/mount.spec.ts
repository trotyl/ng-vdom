import { mount } from '../../src/instructions/mount'
import { Component } from '../../src/shared/component'
import { createElement as h } from '../../src/shared/factory'
import { normalize as n } from '../../src/shared/node'
import { VNode } from '../../src/shared/types'
import { setUpContext } from '../util'

describe('mount instruction', () => {
  let container: HTMLElement
  let input: VNode

  setUpContext()

  beforeEach(() => {
    container = document.createElement('div')
  })

  describe('Text', () => {
    it('should mount text node in string', () => {
      input = n('foo')
      mount(input, container, null)

      expect(input.native!.nodeType).toBe(Node.TEXT_NODE)
      expect(container.innerHTML).toBe(`foo`)
    })

    it('should mount text node in number', () => {
      input = n(42)
      mount(input, container, null)

      expect(input.native!.nodeType).toBe(Node.TEXT_NODE)
      expect(container.innerHTML).toBe(`42`)
    })
  })

  describe('Element', () => {
    it('should mount basic element', () => {
      input = n(h('p'))
      mount(input, container, null)

      expect(input.native!.nodeType).toBe(Node.ELEMENT_NODE)
      expect(container.innerHTML).toBe(`<p></p>`)
    })

    describe('Property', () => {
      it('should mount element with property', () => {
        input = n(h('p', { className: 'foo' }))
        mount(input, container, null)

        expect(input.native!.nodeType).toBe(Node.ELEMENT_NODE)
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

        expect(input.native!.nodeType).toBe(Node.ELEMENT_NODE)
        expect(container.innerHTML).toBe(`<p>foo</p>`)
      })

      it('should mount element with element child', () => {
        input = n(h('p', null, h('span')))
        mount(input, container, null)

        expect(input.native!.nodeType).toBe(Node.ELEMENT_NODE)
        expect(container.innerHTML).toBe(`<p><span></span></p>`)
      })

      it('should mount element with multiple children', () => {
        input = n(h('p', null, 0, h('span', null, 1), 2, h('b', null, 3), 4))
        mount(input, container, null)

        expect(input.native!.nodeType).toBe(Node.ELEMENT_NODE)
        expect(container.innerHTML).toBe(`<p>0<span>1</span>2<b>3</b>4</p>`)
      })
    })
  })

  describe('Class Component', () => {
    it('should mount basic class component', () => {
      class MountComponent extends Component {
        render() { return h('p') }
      }

      input = n(h(MountComponent))
      mount(input, container, null)

      expect(input.native!.nodeType).toBe(Node.ELEMENT_NODE)
      expect(container.innerHTML).toBe(`<p></p>`)
    })

    it('should mount class component with property', () => {
      class MountComponent extends Component<{ value: number }> {
        render() { return h('p', null, this.props.value) }
      }

      input = n(h(MountComponent, { value: 42 }))
      mount(input, container, null)

      expect(input.native!.nodeType).toBe(Node.ELEMENT_NODE)
      expect(container.innerHTML).toBe(`<p>42</p>`)
    })
  })

  describe('Function Component', () => {
    it('should mount basic function component', () => {
      function MountComponent() {
        return h('p')
      }

      input = n(h(MountComponent))
      mount(input, container, null)

      expect(input.native!.nodeType).toBe(Node.ELEMENT_NODE)
      expect(container.innerHTML).toBe(`<p></p>`)
    })

    it('should mount class component with property', () => {
      function TestComponent(props: { value: number }) {
        return h('p', null, props.value)
      }

      input = n(h(TestComponent, { value: 42 }))
      mount(input, container, null)

      expect(input.native!.nodeType).toBe(Node.ELEMENT_NODE)
      expect(container.innerHTML).toBe(`<p>42</p>`)
    })
  })

  describe('Other', () => {
    it('should report error for unsupported type', () => {
      expect(() => mount(n(h({} as any)), container, null)).toThrowError(/Unsupported node type:/)
    })
  })
})
