import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StageRolesAddDialogComponent } from './stage-roles-add-dialog.component';

describe('StageRolesAddDialogComponent', () => {
  let component: StageRolesAddDialogComponent;
  let fixture: ComponentFixture<StageRolesAddDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StageRolesAddDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StageRolesAddDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
