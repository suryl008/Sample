import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSecurityLandingComponent } from './UserSecurityLanding.component';

describe('UserSecurityLandingComponent', () => {
  let component: UserSecurityLandingComponent;
  let fixture: ComponentFixture<UserSecurityLandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserSecurityLandingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserSecurityLandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
