import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MiscdataConfirmDialogComponent } from "./miscdata-confirm-dialog.component";

describe("MiscdataConfirmDialogComponent", () => {
  let component: MiscdataConfirmDialogComponent;
  let fixture: ComponentFixture<MiscdataConfirmDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MiscdataConfirmDialogComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MiscdataConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
