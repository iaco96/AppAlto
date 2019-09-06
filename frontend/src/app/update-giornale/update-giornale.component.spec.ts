import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateGiornaleComponent } from './update-giornale.component';

describe('UpdateGiornaleComponent', () => {
  let component: UpdateGiornaleComponent;
  let fixture: ComponentFixture<UpdateGiornaleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateGiornaleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateGiornaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
