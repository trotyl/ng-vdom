import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { VDomOutlet } from './vdom-outlet'

describe('VDomComponent', () => {
  let component: VDomOutlet
  let fixture: ComponentFixture<VDomOutlet>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VDomOutlet ],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(VDomOutlet)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
