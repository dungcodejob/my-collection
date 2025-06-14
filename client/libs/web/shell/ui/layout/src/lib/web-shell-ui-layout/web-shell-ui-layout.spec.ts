import { ComponentFixture, TestBed } from "@angular/core/testing";
import { WebShellUiLayout } from "./web-shell-ui-layout";

describe("WebShellUiLayout", () => {
  let component: WebShellUiLayout;
  let fixture: ComponentFixture<WebShellUiLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebShellUiLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(WebShellUiLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
