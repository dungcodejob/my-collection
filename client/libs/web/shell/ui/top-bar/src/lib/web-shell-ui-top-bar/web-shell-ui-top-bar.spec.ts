import { ComponentFixture, TestBed } from "@angular/core/testing";
import { WebShellUiTopBar } from "./web-shell-ui-top-bar";

describe("WebShellUiTopBar", () => {
  let component: WebShellUiTopBar;
  let fixture: ComponentFixture<WebShellUiTopBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebShellUiTopBar],
    }).compileComponents();

    fixture = TestBed.createComponent(WebShellUiTopBar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
