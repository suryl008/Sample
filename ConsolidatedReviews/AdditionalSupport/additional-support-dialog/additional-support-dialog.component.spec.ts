import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AdditionalSupportDialogComponent } from "./additional-support-dialog.component";

describe("AdditionalSupportDialogComponent", () => {
  let component: AdditionalSupportDialogComponent;
  let fixture: ComponentFixture<AdditionalSupportDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdditionalSupportDialogComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdditionalSupportDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
