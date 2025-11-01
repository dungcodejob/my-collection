import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AuthLogin } from "./auth-login";

describe("AuthLogin", () => {
  let component: AuthLogin;
  let fixture: ComponentFixture<AuthLogin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthLogin],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthLogin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
