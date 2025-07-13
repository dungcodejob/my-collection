import { ComponentFixture, TestBed } from "@angular/core/testing";
import { McLayout } from "./mc-layout";

describe("McLayout", () => {
  let component: McLayout;
  let fixture: ComponentFixture<McLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [McLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(McLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
