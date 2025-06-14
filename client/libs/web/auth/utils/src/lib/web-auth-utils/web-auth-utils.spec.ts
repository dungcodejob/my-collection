import { ComponentFixture, TestBed } from "@angular/core/testing";
import { WebAuthUtils } from "./web-auth-utils";

describe("WebAuthUtils", () => {
  let component: WebAuthUtils;
  let fixture: ComponentFixture<WebAuthUtils>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebAuthUtils],
    }).compileComponents();

    fixture = TestBed.createComponent(WebAuthUtils);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
