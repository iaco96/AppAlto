import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AvanzamentoComponent } from './avanzamento.component';

describe('AvanzamentoComponent', () => {
  let component: AvanzamentoComponent;
  let fixture: ComponentFixture<AvanzamentoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AvanzamentoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AvanzamentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
