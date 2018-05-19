import { TestBed, inject } from '@angular/core/testing';

import { NgVdomService } from './ng-vdom.service';

describe('NgVdomService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NgVdomService]
    });
  });

  it('should be created', inject([NgVdomService], (service: NgVdomService) => {
    expect(service).toBeTruthy();
  }));
});
