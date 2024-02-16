import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CTEUserComponent } from './cteuser.component';
describe('CTEUserComponent', () => {
  let component: CTEUserComponent;
  let fixture: ComponentFixture<CTEUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CTEUserComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CTEUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
