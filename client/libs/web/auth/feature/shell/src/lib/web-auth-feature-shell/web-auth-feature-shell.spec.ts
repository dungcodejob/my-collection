import { ComponentFixture, TestBed } from "@angular/core/testing";
import { WebAuthFeatureShell } from "./web-auth-feature-shell";

describe("WebAuthFeatureShell", () => {
  let component: WebAuthFeatureShell;
  let fixture: ComponentFixture<WebAuthFeatureShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebAuthFeatureShell],
    }).compileComponents();

    fixture = TestBed.createComponent(WebAuthFeatureShell);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
