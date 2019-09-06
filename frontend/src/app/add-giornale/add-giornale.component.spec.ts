import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddGiornaleComponent } from './add-giornale.component';

describe('AddGiornaleComponent', () => {
  let component: AddGiornaleComponent;
  let fixture: ComponentFixture<AddGiornaleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddGiornaleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddGiornaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
