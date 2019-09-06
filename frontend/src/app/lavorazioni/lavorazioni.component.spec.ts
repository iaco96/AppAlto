import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LavorazioniComponent } from './lavorazioni.component';

describe('LavorazioniComponent', () => {
  let component: LavorazioniComponent;
  let fixture: ComponentFixture<LavorazioniComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LavorazioniComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LavorazioniComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
