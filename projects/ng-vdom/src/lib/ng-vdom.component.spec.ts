import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgVdomComponent } from './ng-vdom.component';

describe('NgVdomComponent', () => {
  let component: NgVdomComponent;
  let fixture: ComponentFixture<NgVdomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgVdomComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgVdomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
