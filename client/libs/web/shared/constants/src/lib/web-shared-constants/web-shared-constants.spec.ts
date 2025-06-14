import { ComponentFixture, TestBed } from "@angular/core/testing";
import { WebSharedConstants } from "./web-shared-constants";

describe("WebSharedConstants", () => {
  let component: WebSharedConstants;
  let fixture: ComponentFixture<WebSharedConstants>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebSharedConstants],
    }).compileComponents();

    fixture = TestBed.createComponent(WebSharedConstants);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
