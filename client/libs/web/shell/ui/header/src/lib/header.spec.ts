import { signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ThemeMode, ThemePreset, ThemeService } from "@client/web-shared-services";
import { MCHeader } from "./header";

describe("MCHeader", () => {
  let component: MCHeader;
  let fixture: ComponentFixture<MCHeader>;

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
      imports: [MCHeader],
      providers: [{ provide: ThemeService, useValue: mockThemeService }],
    }).compileComponents();

    fixture = TestBed.createComponent(MCHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeDefined();
  });

  it("should toggle sidebar when sidebar button is clicked", () => {
    const initialState = component.$sidebarOpen();
    component.toggleSidebar();
    expect(component.$sidebarOpen()).toBe(!initialState);
  });

  it("should open search when search button is clicked", () => {
    component.openSearch();
    expect(component.$searchOpen()).toBe(true);
  });

  it("should render sidebar trigger button", () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const sidebarButton = compiled.querySelector("button[hlmBtn]");
    expect(sidebarButton).toBeTruthy();
  });

  it("should render breadcrumb navigation", () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const breadcrumb = compiled.querySelector("nav");
    expect(breadcrumb).toBeTruthy();
    expect(breadcrumb?.textContent).toContain("Building Your Application");
    expect(breadcrumb?.textContent).toContain("Data Fetching");
  });

  it("should render mode switcher component", () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const modeSwitcher = compiled.querySelector("mc-mode-switcher");
    expect(modeSwitcher).toBeTruthy();
  });
});
