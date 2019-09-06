import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualizzaSalComponent } from './visualizza-sal.component';

describe('VisualizzaSalComponent', () => {
  let component: VisualizzaSalComponent;
  let fixture: ComponentFixture<VisualizzaSalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VisualizzaSalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VisualizzaSalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
