import { mount } from '../../src/instructions/mount'
import { unmount } from '../../src/instructions/unmount'
import { Component } from '../../src/shared/component'
import { createElement as h } from '../../src/shared/factory'
import { normalize as n } from '../../src/shared/node'
import { VNode } from '../../src/shared/types'
import { setUpContext } from '../util'

describe('unmount instruction', () => {
  let container: HTMLElement
  let vNode: VNode

  setUpContext()

  beforeEach(() => {
    container = document.createElement('div')
    vNode = null!
  })

  describe('Element', () => {
    it('should remove event handlers', () => {
      let clicked = false
      vNode = n(h('div', { onClick: () => clicked = true }))
      mount(vNode, container, null)
      unmount(vNode)

      const div = vNode.native as HTMLDivElement
      div.click()

      expect(clicked).toBe(false)
    })
  })

  describe('Class component', () => {
    it('should remove event handlers', () => {
      let clicked = false
      class TestComponent extends Component {
        render() {
          return h('div', { onClick: () => clicked = true })
        }
      }
      vNode = n(h(TestComponent))
      mount(vNode, container, null)
      unmount(vNode)

      const div = vNode.native as HTMLDivElement
      div.click()

      expect(clicked).toBe(false)
    })
  })

  describe('Function component', () => {
    it('should remove event handlers', () => {
      let clicked = false
      function TestComponent() {
        return h('div', { onClick: () => clicked = true })
      }
      vNode = n(h(TestComponent))
      mount(vNode, container, null)
      unmount(vNode)

      const div = vNode.native as HTMLDivElement
      div.click()

      expect(clicked).toBe(false)
    })
  })
})
