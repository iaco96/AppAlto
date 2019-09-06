import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualizzaGiornaliComponent } from './visualizza-giornali.component';

describe('VisualizzaGiornaliComponent', () => {
  let component: VisualizzaGiornaliComponent;
  let fixture: ComponentFixture<VisualizzaGiornaliComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VisualizzaGiornaliComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VisualizzaGiornaliComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
