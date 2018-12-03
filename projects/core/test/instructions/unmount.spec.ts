import { async, TestBed } from '@angular/core/testing'
import { mount } from '../../src/instructions/mount'
import { unmount } from '../../src/instructions/unmount'
import { Component } from '../../src/shared/component'
import { createElement as h } from '../../src/shared/factory'
import { normalize as n } from '../../src/shared/node'
import { COMPONENT_REF, VNode } from '../../src/shared/types'
import { setUpContext, TestAngularComponent, TestModule } from '../util'

describe('unmount instruction', () => {
  let container: HTMLElement
  let vNode: VNode

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ TestModule ],
    }).compileComponents()
  }))

  setUpContext()

  beforeEach(() => {
    container = document.createElement('div')
    vNode = null!
  })

  describe('Native', () => {
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

  describe('Class Component', () => {
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

  describe('Function Component', () => {
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

  describe('Angular Component', () => {
    it('should destroy component', () => {
      const input = n(h(TestAngularComponent))
      mount(input, container, null)
      const spy = spyOn(input.meta![COMPONENT_REF]!, 'destroy')

      unmount(input)

      expect(spy).toHaveBeenCalled()
    })
  })
})
