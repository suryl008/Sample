import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MiscdataDialogComponent } from "./miscdata-dialog.component";

describe("MiscdataDialogComponent", () => {
  let component: MiscdataDialogComponent;
  let fixture: ComponentFixture<MiscdataDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MiscdataDialogComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MiscdataDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
