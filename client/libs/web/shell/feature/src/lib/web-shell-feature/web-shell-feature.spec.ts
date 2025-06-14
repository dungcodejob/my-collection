import { ComponentFixture, TestBed } from "@angular/core/testing";
import { WebShellFeature } from "./web-shell-feature";

describe("WebShellFeature", () => {
  let component: WebShellFeature;
  let fixture: ComponentFixture<WebShellFeature>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebShellFeature],
    }).compileComponents();

    fixture = TestBed.createComponent(WebShellFeature);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
