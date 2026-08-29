import { ComponentFixture, TestBed } from "@angular/core/testing";
import { SubRecipientSearchComponent } from "./SubRecipientSearch.component";

describe("SubRecipientSearchComponent", () => {
  let component: SubRecipientSearchComponent;
  let fixture: ComponentFixture<SubRecipientSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SubRecipientSearchComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SubRecipientSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
