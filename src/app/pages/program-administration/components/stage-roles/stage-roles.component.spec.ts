import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StageRolesComponent } from './stage-roles.component';

describe('StageRolesComponent', () => {
  let component: StageRolesComponent;
  let fixture: ComponentFixture<StageRolesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StageRolesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StageRolesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
