import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualizzaRegistriComponent } from './visualizza-registri.component';

describe('VisualizzaRegistriComponent', () => {
  let component: VisualizzaRegistriComponent;
  let fixture: ComponentFixture<VisualizzaRegistriComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VisualizzaRegistriComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VisualizzaRegistriComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
