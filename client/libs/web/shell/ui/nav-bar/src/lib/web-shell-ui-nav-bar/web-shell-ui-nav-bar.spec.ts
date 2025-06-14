import { ComponentFixture, TestBed } from "@angular/core/testing";
import { WebShellUiNavBar } from "./web-shell-ui-nav-bar";

describe("WebShellUiNavBar", () => {
  let component: WebShellUiNavBar;
  let fixture: ComponentFixture<WebShellUiNavBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebShellUiNavBar],
    }).compileComponents();

    fixture = TestBed.createComponent(WebShellUiNavBar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
