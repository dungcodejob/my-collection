import { ComponentFixture, TestBed } from "@angular/core/testing";
import { WebAuthDataAccess } from "./web-auth-data-access";

describe("WebAuthDataAccess", () => {
  let component: WebAuthDataAccess;
  let fixture: ComponentFixture<WebAuthDataAccess>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebAuthDataAccess],
    }).compileComponents();

    fixture = TestBed.createComponent(WebAuthDataAccess);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
