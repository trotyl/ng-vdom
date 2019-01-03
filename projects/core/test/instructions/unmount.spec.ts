import { async, TestBed } from '@angular/core/testing'
import { mount } from '../../src/instructions/mount'
import { unmount } from '../../src/instructions/unmount'
import { Component } from '../../src/shared/component'
import { createElement as h } from '../../src/shared/factory'
import { normalize as n } from '../../src/shared/node'
import { getCurrentRenderKit, RenderKit } from '../../src/shared/render-kit'
import { COMPONENT_REF, VNode } from '../../src/shared/types'
import { setUpContext, TestAngularProps, TestModule } from '../util'

describe('unmount instruction', () => {
  let container: HTMLElement
  let vNode: VNode
  let kit: RenderKit

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ TestModule ],
    }).compileComponents()
  }))

  setUpContext()

  beforeEach(() => {
    container = document.createElement('div')
    vNode = null!
    kit = getCurrentRenderKit()!
  })

  describe('Native', () => {
    it('should remove event handlers', () => {
      let clicked = false
      vNode = n(h('div', { onClick: () => clicked = true }))
      mount(kit, vNode, container, null)
      unmount(kit, vNode)

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
      mount(kit, vNode, container, null)
      unmount(kit, vNode)

      const div = vNode.native as HTMLDivElement
      div.click()

      expect(clicked).toBe(false)
    })

    it('should invoke willUnmount callback', () => {
      let willUnmount = false

      class WillUnmountComponent extends Component {
        componentWillUnmount() { willUnmount = true }

        render() { return h('p') }
      }

      vNode = n(h(WillUnmountComponent))
      mount(kit, vNode, container, null)
      unmount(kit, vNode)

      expect(willUnmount).toBe(true)
    })
  })

  describe('Function Component', () => {
    it('should remove event handlers', () => {
      let clicked = false
      function TestComponent() {
        return h('div', { onClick: () => clicked = true })
      }
      vNode = n(h(TestComponent))
      mount(kit, vNode, container, null)
      unmount(kit, vNode)

      const div = vNode.native as HTMLDivElement
      div.click()

      expect(clicked).toBe(false)
    })
  })

  describe('Angular Component', () => {
    it('should destroy component', () => {
      const input = n(h(TestAngularProps))
      mount(kit, input, container, null)
      const spy = spyOn(input.meta![COMPONENT_REF]!, 'destroy')

      unmount(kit, input)

      expect(spy).toHaveBeenCalled()
    })
  })
})
