import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetadataConfirmDialogComponent } from './metadata-confirm-dialog.component';

describe('MetadataConfirmDialogComponent', () => {
  let component: MetadataConfirmDialogComponent;
  let fixture: ComponentFixture<MetadataConfirmDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MetadataConfirmDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MetadataConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
