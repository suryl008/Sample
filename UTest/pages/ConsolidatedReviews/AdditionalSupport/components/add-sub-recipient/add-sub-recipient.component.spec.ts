import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AddSubRecipientComponent } from "./add-sub-recipient.component";

describe("AddSubRecipientComponent", () => {
  let component: AddSubRecipientComponent;
  let fixture: ComponentFixture<AddSubRecipientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddSubRecipientComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSubRecipientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
