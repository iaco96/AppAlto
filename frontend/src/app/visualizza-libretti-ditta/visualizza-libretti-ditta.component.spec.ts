import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualizzaLibrettiDittaComponent } from './visualizza-libretti-ditta.component';

describe('VisualizzaLibrettiDittaComponent', () => {
  let component: VisualizzaLibrettiDittaComponent;
  let fixture: ComponentFixture<VisualizzaLibrettiDittaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VisualizzaLibrettiDittaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VisualizzaLibrettiDittaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
