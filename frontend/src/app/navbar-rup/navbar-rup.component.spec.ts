import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarRupComponent } from './navbar-rup.component';

describe('NavbarRupComponent', () => {
  let component: NavbarRupComponent;
  let fixture: ComponentFixture<NavbarRupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NavbarRupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarRupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
