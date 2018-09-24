import { Component, DebugElement } from '@angular/core'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { By } from '@angular/platform-browser'
import { createElement, Component as VComponent } from './factory'
import { VNode } from './shared/node'
import { TASK_SCHEDULER, VDomOutlet } from './vdom-outlet'
import { VDomModule } from './vdom.module'

@Component({
  template: `
    <v-outlet [def]="def"></v-outlet>
  `,
})
class TestContainer {
  def: VNode | null = null
}

describe('VDomComponent', () => {
  let container: TestContainer
  let outlet: DebugElement
  let fixture: ComponentFixture<TestContainer>

  function assertResult(def: VNode | null, text: string) {
    setDef(def)
    expect(getHtml()).toBe(text)
  }

  function setDef(def: VNode | null): void {
    container.def = def
    fixture.detectChanges()
  }

  function getHtml(): string {
    return outlet.nativeElement.innerHTML
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        TestContainer,
      ],
      imports: [
        VDomModule,
      ],
      providers: [
        { provide: TASK_SCHEDULER, useValue: (fn: Function) => fn() },
      ],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TestContainer)
    container = fixture.componentInstance
    fixture.detectChanges()
    outlet = fixture.debugElement.query(By.directive(VDomOutlet))
  })

  it('should render static text', () => {
    assertResult('Foo', `Foo`)
  })

  it('should render bare element', () => {
    assertResult(
      createElement('span'),
      `<span></span>`,
    )
  })

  it('should render element with attributes', () => {
    assertResult(
      createElement('span', { id: 'foo' }),
      `<span id="foo"></span>`,
    )
  })

  it('should render element with text child', () => {
    assertResult(
      createElement('span', null, 'Foo'),
      `<span>Foo</span>`,
    )
  })

  it('should render element with element child', () => {
    assertResult(
      createElement('p', null, createElement('span')),
      `<p><span></span></p>`,
    )
  })

  it('should render element with multiple children', () => {
    assertResult(
      createElement('p', null, createElement('span'), 'Foo', createElement('b')),
      `<p><span></span>Foo<b></b></p>`,
    )
  })

  it('should support replacing def in text', () => {
    assertResult('Foo', 'Foo')
    assertResult('Bar', 'Bar')
  })

  it('should support replacing def in element', () => {
    assertResult(createElement('p'), '<p></p>')
    assertResult(createElement('span'), '<span></span>')
  })

  it('should support replacing def in element with different property', () => {
    assertResult(createElement('p', { className: 'foo' }), '<p class="foo"></p>')
    assertResult(createElement('p', { className: 'bar' }), '<p class="bar"></p>')
  })

  it('should support replacing def in element with same children', () => {
    assertResult(createElement('p', null, 2, 4), '<p>24</p>')
    assertResult(createElement('p', null, 2, 4), '<p>24</p>')
  })

  it('should support replacing def in element with different children', () => {
    assertResult(createElement('p', null, 'Foo', createElement('span'), createElement('b')), '<p>Foo<span></span><b></b></p>')
    assertResult(createElement('p', null, createElement('span'), 2, 4), '<p><span></span>24</p>')
  })

  it('should support replacing def in different form', () => {
    assertResult('Foo', 'Foo')
    assertResult(createElement('p'), '<p></p>')
  })

  describe('Component', () => {
    let forceUpdate = () => {}
    let setState = (state: object) => {}

    class FooComponent extends VComponent {
      constructor(props: any) {
        super(props)

        this.state = { foo: 0 }

        forceUpdate = this.forceUpdate.bind(this)
        setState = this.setState.bind(this)
      }

      render() {
        return createElement('p', null, `Foo: ${this.state.foo}`)
      }
    }

    it('should support component as child', () => {
      assertResult(createElement('div', null, 'start', createElement(FooComponent), 'end'), '<div>start<p>Foo: 0</p>end</div>')
    })

    // TODO: add support
    it('should not support forceUpdate', () => {
      assertResult(createElement(FooComponent), '<p>Foo: 0</p>')
      expect(() => forceUpdate()).toThrowError(/Not implemented/)
    })

    it('should support setState', () => {
      assertResult(createElement(FooComponent), '<p>Foo: 0</p>')

      setState({ foo: 1 })
      fixture.detectChanges()

      expect(getHtml()).toBe('<p>Foo: 1</p>')
    })

    it('should support setState as function', () => {
      assertResult(createElement(FooComponent), '<p>Foo: 0</p>')

      setState(() => ({ foo: 1 }))
      fixture.detectChanges()

      expect(getHtml()).toBe('<p>Foo: 1</p>')
    })
  })

  describe('SFC', () => {
    function FooComponent({ foo }: { foo: number }) {
      return createElement('p', null, `Foo: ${foo}`)
    }

    it('should support SFC', () => {
      assertResult(createElement(FooComponent, { foo: 0 }), '<p>Foo: 0</p>')
    })
  })
})
