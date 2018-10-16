import { mount } from '../../src/instructions/mount'
import { Component } from '../../src/shared/component'
import { createElement as h } from '../../src/shared/factory'
import { setUpContext } from '../util'

describe('mount instruction', () => {
  let container: HTMLElement

  setUpContext()

  beforeEach(() => {
    container = document.createElement('div')
  })

  describe('Text', () => {
    it('should mount text node in string', () => {
      const result = mount('foo', container) as Text

      expect(result.nodeType).toBe(Node.TEXT_NODE)
      expect(container.innerHTML).toBe(`foo`)
    })

    it('should mount text node in number', () => {
      const result = mount(42, container) as Text

      expect(result.nodeType).toBe(Node.TEXT_NODE)
      expect(container.innerHTML).toBe(`42`)
    })
  })

  describe('Element', () => {
    it('should mount basic element', () => {
      const result = mount(h('p'), container) as HTMLParagraphElement

      expect(result.nodeType).toBe(Node.ELEMENT_NODE)
      expect(container.innerHTML).toBe(`<p></p>`)
    })

    describe('Property', () => {
      it('should mount element with property', () => {
        const result = mount(h('p', { className: 'foo' }), container) as HTMLParagraphElement

        expect(result.nodeType).toBe(Node.ELEMENT_NODE)
        expect(container.innerHTML).toBe(`<p class="foo"></p>`)
      })

      describe('Event', () => {
        it('should add event listener', () => {
          let clicked = false
          const result = mount(h('p', { onClick: () => { clicked = true } }), container) as HTMLParagraphElement

          result.dispatchEvent(new CustomEvent('click'))

          expect(clicked).toBe(true)
        })
      })
    })

    describe('Child', () => {
      it('should mount element with text child', () => {
        const result = mount(h('p', null, 'foo'), container) as HTMLParagraphElement

        expect(result.nodeType).toBe(Node.ELEMENT_NODE)
        expect(container.innerHTML).toBe(`<p>foo</p>`)
      })

      it('should mount element with element child', () => {
        const result = mount(h('p', null, h('span')), container) as HTMLParagraphElement

        expect(result.nodeType).toBe(Node.ELEMENT_NODE)
        expect(container.innerHTML).toBe(`<p><span></span></p>`)
      })

      it('should mount element with multiple children', () => {
        const result = mount(h('p', null, 0, h('span', null, 1), 2, h('b', null, 3), 4), container) as HTMLParagraphElement

        expect(result.nodeType).toBe(Node.ELEMENT_NODE)
        expect(container.innerHTML).toBe(`<p>0<span>1</span>2<b>3</b>4</p>`)
      })
    })
  })

  describe('Component', () => {
    describe('Class Component', () => {
      it('should mount basic class component', () => {
        class MountComponent extends Component {
          render() { return h('p') }
        }

        const result = mount(h(MountComponent), container) as HTMLParagraphElement

        expect(result.nodeType).toBe(Node.ELEMENT_NODE)
        expect(container.innerHTML).toBe(`<p></p>`)
      })

      it('should mount class component with property', () => {
        class MountComponent extends Component<{ value: number }> {
          render() { return h('p', null, this.props.value) }
        }

        const result = mount(h(MountComponent, { value: 42 }), container) as HTMLParagraphElement

        expect(result.nodeType).toBe(Node.ELEMENT_NODE)
        expect(container.innerHTML).toBe(`<p>42</p>`)
      })
    })

    describe('Function Component', () => {
      it('should mount basic function component', () => {
        function MountComponent() {
          return h('p')
        }

        const result = mount(h(MountComponent), container) as HTMLParagraphElement

        expect(result.nodeType).toBe(Node.ELEMENT_NODE)
        expect(container.innerHTML).toBe(`<p></p>`)
      })

      it('should mount class component with property', () => {
        function TestComponent(props: { value: number }) {
          return h('p', null, props.value)
        }

        const result = mount(h(TestComponent, { value: 42 }), container) as HTMLParagraphElement

        expect(result.nodeType).toBe(Node.ELEMENT_NODE)
        expect(container.innerHTML).toBe(`<p>42</p>`)
      })
    })
  })

  describe('Other', () => {
    it('should report error for unsupported type', () => {
      expect(() => mount(h({} as any), container)).toThrowError(/Unsupported node type:/)
    })
  })
})
