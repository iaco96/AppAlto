import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualizzaLibrettiComponent } from './visualizza-libretti.component';

describe('VisualizzaLibrettiComponent', () => {
  let component: VisualizzaLibrettiComponent;
  let fixture: ComponentFixture<VisualizzaLibrettiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VisualizzaLibrettiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VisualizzaLibrettiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
