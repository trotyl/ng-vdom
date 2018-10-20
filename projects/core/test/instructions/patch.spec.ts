import { mount } from '../../src/instructions/mount'
import { patch } from '../../src/instructions/patch'
import { Component } from '../../src/shared/component'
import { createElement as h } from '../../src/shared/factory'
import { normalize as n } from '../../src/shared/node'
import { VNode } from '../../src/shared/types'
import { setUpContext } from '../util'

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

  describe('Previous: Text', () => {
    beforeEach(() => {
      previous = n('foo')
    })

    describe('Next: Text', () => {
      beforeEach(() => {
        next = n('bar')
      })

      it('should patch with text node', () => {
        mount(previous, container, null)

        patch(previous, next, container)

        expect(next.native).toBe(previous.native)
        expect(container.innerHTML).toBe('bar')
      })
    })

    describe('Next: Void', () => {
      beforeEach(() => {
        next = n(null)
      })

      it('should patch with void node', () => {
        mount(previous, container, null)

        patch(previous, next, container)

        expect(next.native).not.toBeNull()
        expect(container.innerHTML).toBe(`<!--void-->`)
      })
    })

    describe('Next: Element', () => {
      beforeEach(() => {
        next = n(h('p', { className: 'foo' }, 42))
      })

      it('should patch with element', () => {
        mount(previous, container, null)

        patch(previous, next, container)

        expect(next.native).not.toBeNull()
        expect(container.innerHTML).toBe('<p class="foo">42</p>')
      })
    })

    describe('Next: Class Component', () => {
      class NextComponent extends Component {
        render() { return h('p', { className: 'foo' }, 42) }
      }

      beforeEach(() => {
        next = n(h(NextComponent))
      })

      it('should patch with class component', () => {
        mount(previous, container, null)

        patch(previous, next, container)

        expect(next.native).not.toBeNull()
        expect(container.innerHTML).toBe('<p class="foo">42</p>')
      })
    })

    describe('Next: function Component', () => {
      function NextComponent() {
        return h('p', { className: 'foo' }, 42)
      }

      beforeEach(() => {
        next = n(h(NextComponent))
      })

      it('should patch with function component', () => {
        mount(previous, container, null)

        patch(previous, next, container)

        expect(next.native).not.toBeNull()
        expect(container.innerHTML).toBe('<p class="foo">42</p>')
      })
    })
  })

  describe('Previous: Void', () => {
    beforeEach(() => {
      previous = n(null)
    })

    describe('Next: Text', () => {
      beforeEach(() => {
        next = n('bar')
      })

      it('should patch with text node', () => {
        mount(previous, container, null)

        patch(previous, next, container)

        expect(next.native).not.toBeNull()
        expect(container.innerHTML).toBe('bar')
      })
    })

    describe('Next: Void', () => {
      beforeEach(() => {
        next = n(null)
      })

      it('should patch with void node', () => {
        mount(previous, container, null)

        patch(previous, next, container)

        expect(next.native).toBe(previous.native)
        expect(container.innerHTML).toBe(`<!--void-->`)
      })
    })

    describe('Next: Element', () => {
      beforeEach(() => {
        next = n(h('p', { className: 'foo' }, 42))
      })

      it('should patch with element', () => {
        mount(previous, container, null)

        patch(previous, next, container)

        expect(next.native).not.toBeNull()
        expect(container.innerHTML).toBe('<p class="foo">42</p>')
      })
    })

    describe('Next: Class Component', () => {
      class NextComponent extends Component {
        render() { return h('p', { className: 'foo' }, 42) }
      }

      beforeEach(() => {
        next = n(h(NextComponent))
      })

      it('should patch with class component', () => {
        mount(previous, container, null)

        patch(previous, next, container)

        expect(next.native).not.toBeNull()
        expect(container.innerHTML).toBe('<p class="foo">42</p>')
      })
    })

    describe('Next: function Component', () => {
      function NextComponent() {
        return h('p', { className: 'foo' }, 42)
      }

      beforeEach(() => {
        next = n(h(NextComponent))
      })

      it('should patch with function component', () => {
        mount(previous, container, null)

        patch(previous, next, container)

        expect(next.native).not.toBeNull()
        expect(container.innerHTML).toBe('<p class="foo">42</p>')
      })
    })
  })

  describe('Previous: Element', () => {
    beforeEach(() => {
      previous = n(h('p', { id: 'foo' }, 0))
    })

    describe('Next: Text', () => {
      beforeEach(() => {
        next = n('bar')
      })

      it('should patch with text node', () => {
        mount(previous, container, null)

        patch(previous, next, container)

        expect(next.native).not.toBeNull()
        expect(container.innerHTML).toBe('bar')
      })
    })

    describe('Next: Void', () => {
      beforeEach(() => {
        next = n(null)
      })

      it('should patch with void node', () => {
        mount(previous, container, null)

        patch(previous, next, container)

        expect(next.native).not.toBeNull()
        expect(container.innerHTML).toBe(`<!--void-->`)
      })
    })

    describe('Next: Element', () => {
      describe('in same tag', () => {
        it('should patch with same element', () => {
          next = n(h('p'))
          mount(previous, container, null)

          patch(previous, next, container)

          expect(next.native).toBe(previous.native)
          expect(container.innerHTML).toBe('<p></p>')
        })

        it('should patch with new property', () => {
          next = n(h('p', { className: 'foo', title: 'bar' }))
          mount(previous, container, null)

          patch(previous, next, container)

          expect(next.native).toBe(previous.native)
          expect(container.innerHTML).toBe('<p class="foo" title="bar"></p>')
        })

        it('should patch with new children', () => {
          next = n(h('p', null, 0, h('span', null, 1), 2))
          mount(previous, container, null)

          patch(previous, next, container)

          expect(next.native).toBe(previous.native)
          expect(container.innerHTML).toBe('<p>0<span>1</span>2</p>')
        })
      })

      describe('in different tag', () => {
        it('should patch with different element', () => {
          next = n(h('div', { className: 'bar' }, '42'))
          mount(previous, container, null)

          patch(previous, next, container)

          expect(next.native).not.toBeNull()
          expect(container.innerHTML).toBe('<div class="bar">42</div>')
        })
      })
    })

    describe('Next: class Component', () => {
      class NextComponent extends Component {
        render() { return h('p', { className: 'foo' }, 42) }
      }

      beforeEach(() => {
        next = n(h(NextComponent))
      })

      it('should patch with class component', () => {
        mount(previous, container, null)

        patch(previous, next, container)

        expect(next.native).not.toBeNull()
        expect(container.innerHTML).toBe('<p class="foo">42</p>')
      })
    })

    describe('Next: function Component', () => {
      function NextComponent() {
        return h('p', { className: 'foo' }, 42)
      }

      beforeEach(() => {
        next = n(h(NextComponent))
      })

      it('should patch with function component', () => {
        mount(previous, container, null)

        patch(previous, next, container)

        expect(next.native).not.toBeNull()
        expect(container.innerHTML).toBe('<p class="foo">42</p>')
      })
    })
  })

  describe('Previous: class Component', () => {
    class PreviousComponent extends Component<{ className: string }> {
      render() { return h('div', { className: this.props.className }, 0) }
    }

    beforeEach(() => {
      previous = n(h(PreviousComponent, { className: 'foo' }))
    })

    describe('Next: Text', () => {
      beforeEach(() => {
        next = n('bar')
      })

      it('should patch with text node', () => {
        mount(previous, container, null)

        patch(previous, next, container)

        expect(next.native).not.toBeNull()
        expect(container.innerHTML).toBe('bar')
      })
    })

    describe('Next: Void', () => {
      beforeEach(() => {
        next = n(null)
      })

      it('should patch with void node', () => {
        mount(previous, container, null)

        patch(previous, next, container)

        expect(next.native).not.toBeNull()
        expect(container.innerHTML).toBe(`<!--void-->`)
      })
    })

    describe('Next: Element', () => {
      beforeEach(() => {
        next = n(h('p', { className: 'bar' }, 1))
      })

      it('should patch with element', () => {
        mount(previous, container, null)

        patch(previous, next, container)

        expect(next.native).not.toBeNull()
        expect(container.innerHTML).toBe('<p class="bar">1</p>')
      })
    })

    describe('Next: class Component', () => {
      it('should patch with same class component with same props', () => {
        next = n(h(PreviousComponent, { className: 'foo' }))
        mount(previous, container, null)

        patch(previous, next, container)

        expect(next.native).toBe(previous.native)
        expect(container.innerHTML).toBe('<div class="foo">0</div>')
      })

      it('should patch with same class component with different props', () => {
        next = n(h(PreviousComponent, { className: 'bar' }))
        mount(previous, container, null)

        patch(previous, next, container)

        expect(next.native).toBe(previous.native)
        expect(container.innerHTML).toBe('<div class="bar">0</div>')
      })

      it('should patch with same class component with different root node', () => {
        let flag = true
        class NextComponent extends Component {
          render() {
            return flag ? h('p', { className: 'foo' }, 42) : h('div', { className: 'bar' }, 0)
          }
        }

        previous = n(h(NextComponent))
        next = n(h(NextComponent))
        mount(previous, container, null)

        flag = false
        patch(previous, next, container)

        expect(next.native).not.toBeNull()
        expect(container.innerHTML).toBe('<div class="bar">0</div>')
      })

      it('should patch with different class component', () => {
        class NextComponent extends Component {
          render() {
            return h('p', { className: 'foo' }, 42)
          }
        }

        next = n(h(NextComponent))
        mount(previous, container, null)

        patch(previous, next, container)

        expect(next.native).not.toBeNull()
        expect(container.innerHTML).toBe('<p class="foo">42</p>')
      })
    })

    describe('Next: function Component', () => {
      function TestComponent() {
        return h('p', { className: 'foo' }, 42)
      }

      beforeEach(() => {
        next = n(h(TestComponent))
      })

      it('should patch with function component', () => {
        mount(previous, container, null)

        patch(previous, next, container)

        expect(next.native).not.toBeNull()
        expect(container.innerHTML).toBe('<p class="foo">42</p>')
      })
    })
  })

  describe('Previous: class Component', () => {
    function PreviousComponent(props: { className: string }) {
      return h('div', { className: props.className }, 0)
    }

    beforeEach(() => {
      previous = n(h(PreviousComponent, { className: 'foo' }))
    })

    describe('Next: Text', () => {
      beforeEach(() => {
        next = n('bar')
      })

      it('should patch with text node', () => {
        mount(previous, container, null)

        patch(previous, next, container)

        expect(next.native).not.toBeNull()
        expect(container.innerHTML).toBe('bar')
      })
    })

    describe('Next: Void', () => {
      beforeEach(() => {
        next = n(null)
      })

      it('should patch with void node', () => {
        mount(previous, container, null)

        patch(previous, next, container)

        expect(next.native).not.toBeNull()
        expect(container.innerHTML).toBe(`<!--void-->`)
      })
    })

    describe('Next: Element', () => {
      beforeEach(() => {
        next = n(h('p', { className: 'bar' }, 1))
      })

      it('should patch with element', () => {
        mount(previous, container, null)

        patch(previous, next, container)

        expect(next.native).not.toBeNull()
        expect(container.innerHTML).toBe('<p class="bar">1</p>')
      })
    })

    describe('Next: class Component', () => {
      class NextComponent extends Component<{ className: string }> {
        render() { return h('div', { className: this.props.className }, 0) }
      }

      beforeEach(() => {
        next = n(h(NextComponent, { className: 'bar' }))
      })

      it('should patch with same class component with same node', () => {
        mount(previous, container, null)

        patch(previous, next, container)

        expect(next.native).not.toBeNull()
        expect(container.innerHTML).toBe('<div class="bar">0</div>')
      })
    })

    describe('Next: function Component', () => {
      it('should patch with same function component in same props', () => {
        next = n(h(PreviousComponent, { className: 'foo' }))
        mount(previous, container, null)

        patch(previous, next, container)

        expect(next.native).toBe(previous.native)
        expect(container.innerHTML).toBe('<div class="foo">0</div>')
      })

      it('should patch with same function component in different props', () => {
        next = n(h(PreviousComponent, { className: 'bar' }))
        mount(previous, container, null)

        patch(previous, next, container)

        expect(next.native).toBe(previous.native)
        expect(container.innerHTML).toBe('<div class="bar">0</div>')
      })
    })
  })
})
