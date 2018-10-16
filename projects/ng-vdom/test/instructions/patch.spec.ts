import { mount } from '../../src/instructions/mount'
import { patch } from '../../src/instructions/patch'
import { Component } from '../../src/shared/component'
import { createElement as h } from '../../src/shared/factory'
import { VNode } from '../../src/shared/node'
import { setUpContext } from '../util'

describe('patch instruction', () => {
  let container: HTMLElement
  let node: Node
  let previous: VNode
  let next: VNode

  setUpContext()

  beforeEach(() => {
    container = document.createElement('div')
    node = null!
    previous = null!
    next = null!
  })

  describe('Previous: Text', () => {
    beforeEach(() => {
      previous = 'foo'
    })

    describe('Next: Text', () => {
      beforeEach(() => {
        next = 'bar'
      })

      it('should patch with text node', () => {
        node = mount(previous, container)

        const result = patch(previous, next, node, container)

        expect(result).toBe(node)
        expect(container.innerHTML).toBe('bar')
      })
    })

    describe('Next: Element', () => {
      beforeEach(() => {
        next = h('p', { className: 'foo' }, 42)
      })

      it('should patch with element', () => {
        node = mount(previous, container)

        const result = patch(previous, next, node, container)

        expect(result.nodeType).toBe(Node.ELEMENT_NODE)
        expect(container.innerHTML).toBe('<p class="foo">42</p>')
      })
    })

    describe('Next: class Component', () => {
      class NextComponent extends Component {
        render() { return h('p', { className: 'foo' }, 42) }
      }

      beforeEach(() => {
        next = h(NextComponent)
      })

      it('should patch with class component', () => {
        node = mount(previous, container)

        const result = patch(previous, next, node, container)

        expect(result.nodeType).toBe(Node.ELEMENT_NODE)
        expect(container.innerHTML).toBe('<p class="foo">42</p>')
      })
    })

    describe('Next: function Component', () => {
      function NextComponent() {
        return h('p', { className: 'foo' }, 42)
      }

      beforeEach(() => {
        next = h(NextComponent)
      })

      it('should patch with function component', () => {
        node = mount(previous, container)

        const result = patch(previous, next, node, container)

        expect(result.nodeType).toBe(Node.ELEMENT_NODE)
        expect(container.innerHTML).toBe('<p class="foo">42</p>')
      })
    })
  })

  describe('Previous: Element', () => {
    beforeEach(() => {
      previous = h('p', { id: 'foo' }, 0)
    })

    describe('Next: Text', () => {
      beforeEach(() => {
        next = 'bar'
      })

      it('should patch with text node', () => {
        node = mount(previous, container)

        const result = patch(previous, next, node, container)

        expect(result.nodeType).toBe(Node.TEXT_NODE)
        expect(container.innerHTML).toBe('bar')
      })
    })

    describe('Next: Element', () => {
      describe('in same tag', () => {
        it('should patch with same element', () => {
          next = h('p')
          node = mount(previous, container)

          const result = patch(previous, next, node, container)

          expect(result).toBe(node)
          expect(container.innerHTML).toBe('<p></p>')
        })

        it('should patch with new property', () => {
          next = h('p', { className: 'foo', title: 'bar' })
          node = mount(previous, container)

          const result = patch(previous, next, node, container)

          expect(result).toBe(node)
          expect(container.innerHTML).toBe('<p class="foo" title="bar"></p>')
        })

        it('should patch with new children', () => {
          next = h('p', null, 0, h('span', null, 1), 2)
          node = mount(previous, container)

          const result = patch(previous, next, node, container)

          expect(result).toBe(node)
          expect(container.innerHTML).toBe('<p>0<span>1</span>2</p>')
        })
      })

      describe('in different tag', () => {
        it('should patch with different element', () => {
          next = h('div', { className: 'bar' }, '42')
          node = mount(previous, container)

          const result = patch(previous, next, node, container)

          expect(result.nodeType).toBe(Node.ELEMENT_NODE)
          expect(container.innerHTML).toBe('<div class="bar">42</div>')
        })
      })
    })

    describe('Next: class Component', () => {
      class NextComponent extends Component {
        render() { return h('p', { className: 'foo' }, 42) }
      }

      beforeEach(() => {
        next = h(NextComponent)
      })

      it('should patch with class component', () => {
        node = mount(previous, container)

        const result = patch(previous, next, node, container)

        expect(result.nodeType).toBe(Node.ELEMENT_NODE)
        expect(container.innerHTML).toBe('<p class="foo">42</p>')
      })
    })

    describe('Next: function Component', () => {
      function NextComponent() {
        return h('p', { className: 'foo' }, 42)
      }

      beforeEach(() => {
        next = h(NextComponent)
      })

      it('should patch with function component', () => {
        node = mount(previous, container)

        const result = patch(previous, next, node, container)

        expect(result.nodeType).toBe(Node.ELEMENT_NODE)
        expect(container.innerHTML).toBe('<p class="foo">42</p>')
      })
    })
  })

  describe('Previous: class Component', () => {
    class PreviousComponent extends Component {
      render() { return h('div', { className: 'bar' }, 0) }
    }

    beforeEach(() => {
      previous = h(PreviousComponent)
    })

    describe('Next: Text', () => {
      beforeEach(() => {
        next = 'bar'
      })

      it('should patch with text node', () => {
        node = mount(previous, container)

        const result = patch(previous, next, node, container)

        expect(result.nodeType).toBe(Node.TEXT_NODE)
        expect(container.innerHTML).toBe('bar')
      })
    })

    describe('Next: Element', () => {
      beforeEach(() => {
        next = h('p', { className: 'foo' }, 1)
      })

      it('should patch with element', () => {
        node = mount(previous, container)

        const result = patch(previous, next, node, container)

        expect(result.nodeType).toBe(Node.ELEMENT_NODE)
        expect(container.innerHTML).toBe('<p class="foo">1</p>')
      })
    })

    describe('Next: class Component', () => {
      it('should patch with same class component with same node', () => {
        next = h(PreviousComponent)
        node = mount(previous, container)

        const result = patch(previous, next, node, container)

        expect(result).toBe(node)
        expect(container.innerHTML).toBe('<div class="bar">0</div>')
      })

      it('should patch with same class component with different node', () => {
        let flag = true
        class NextComponent extends Component {
          render() {
            return flag ? h('p', { className: 'foo' }, 42) : h('div', { className: 'bar' }, 0)
          }
        }

        previous = h(NextComponent)
        next = h(NextComponent)
        node = mount(previous, container)

        flag = false
        const result = patch(previous, next, node, container)

        expect(result.nodeType).toBe(Node.ELEMENT_NODE)
        expect(container.innerHTML).toBe('<div class="bar">0</div>')
      })

      it('should patch with different class component', () => {
        class NextComponent extends Component {
          render() {
            return h('p', { className: 'foo' }, 42)
          }
        }

        next = h(NextComponent)
        node = mount(previous, container)

        const result = patch(previous, next, node, container)

        expect(result.nodeType).toBe(Node.ELEMENT_NODE)
        expect(container.innerHTML).toBe('<p class="foo">42</p>')
      })
    })

    describe('Next: function Component', () => {
      function TestComponent() {
        return h('p', { className: 'foo' }, 42)
      }

      beforeEach(() => {
        next = h(TestComponent)
      })

      it('should patch with function component', () => {
        node = mount(previous, container)

        const result = patch(previous, next, node, container)

        expect(result.nodeType).toBe(Node.ELEMENT_NODE)
        expect(container.innerHTML).toBe('<p class="foo">42</p>')
      })
    })
  })
})
