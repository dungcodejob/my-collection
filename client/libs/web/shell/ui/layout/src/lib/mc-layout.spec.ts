import { signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideAnimations } from "@angular/platform-browser/animations";
import { ThemeMode, ThemePreset, ThemeService } from "@client/web-shared-services";
import { MCLayout } from "./mc-layout";

describe("MCLayout", () => {
  let component: MCLayout;
  let fixture: ComponentFixture<MCLayout>;

  beforeEach(async () => {
    // Mock ThemeService
    const mockThemeService = {
      mode: signal(ThemeMode.Light),
      isDarkMode: signal(false),
      preset: signal(ThemePreset.Aura),
      setMode: jest.fn(),
      setPreset: jest.fn(),
      toggleMode: jest.fn(),
      initialize: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [MCLayout],
      providers: [
        provideAnimations(),
        { provide: ThemeService, useValue: mockThemeService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MCLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
