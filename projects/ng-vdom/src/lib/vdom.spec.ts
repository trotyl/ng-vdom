import { TestBed, inject } from '@angular/core/testing'

import { VDom } from './vdom'

describe('VDomService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VDom]
    })
  })

  it('should be created', inject([VDom], (service: VDom) => {
    expect(service).toBeTruthy()
  }))
})
