import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GEMSUserSearchComponent } from './GEMSUserSearch.component';

describe('UserSecurityScreenComponent', () => {
  let component: GEMSUserSearchComponent;
  let fixture: ComponentFixture<GEMSUserSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GEMSUserSearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GEMSUserSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
