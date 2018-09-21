import { Component, DebugElement } from '@angular/core'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { By } from '@angular/platform-browser'
import { createElement } from './factory'
import { VNode } from './shared/types'
import { VDomOutlet } from './vdom-outlet'
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
    container.def = def

    fixture.detectChanges()

    expect(outlet.nativeElement.innerHTML).toBe(text)
  }


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        TestContainer,
      ],
      imports: [
        VDomModule,
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
})
