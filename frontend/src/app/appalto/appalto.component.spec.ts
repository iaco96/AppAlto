import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppaltoComponent } from './appalto.component';

describe('AppaltoComponent', () => {
  let component: AppaltoComponent;
  let fixture: ComponentFixture<AppaltoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppaltoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppaltoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
