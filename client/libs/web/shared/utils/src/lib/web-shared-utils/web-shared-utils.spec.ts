import { ComponentFixture, TestBed } from "@angular/core/testing";
import { WebSharedUtils } from "./web-shared-utils";

describe("WebSharedUtils", () => {
  let component: WebSharedUtils;
  let fixture: ComponentFixture<WebSharedUtils>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebSharedUtils],
    }).compileComponents();

    fixture = TestBed.createComponent(WebSharedUtils);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
