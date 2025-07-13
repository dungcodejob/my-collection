import { ComponentFixture, TestBed } from "@angular/core/testing";
import { McNavBar } from "./mc-nav-bar";

describe("McNavBar", () => {
  let component: McNavBar;
  let fixture: ComponentFixture<McNavBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [McNavBar],
    }).compileComponents();

    fixture = TestBed.createComponent(McNavBar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
