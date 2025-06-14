import { ComponentFixture, TestBed } from "@angular/core/testing";
import { WebAuthFeatureLogin } from "./web-auth-feature-login";

describe("WebAuthFeatureLogin", () => {
  let component: WebAuthFeatureLogin;
  let fixture: ComponentFixture<WebAuthFeatureLogin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebAuthFeatureLogin],
    }).compileComponents();

    fixture = TestBed.createComponent(WebAuthFeatureLogin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
