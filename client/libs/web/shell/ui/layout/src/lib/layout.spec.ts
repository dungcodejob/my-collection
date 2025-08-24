import { signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideAnimations } from "@angular/platform-browser/animations";
import { ActivatedRoute } from "@angular/router";
import { CollectionStore } from "@client/web-collection-data-access";
import { MCThemeService, ThemeMode, ThemePreset } from "@client/web-shared-services";
import { of } from "rxjs";
import { MCLayout } from "./layout";

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
        CollectionStore,
        { provide: MCThemeService, useValue: mockThemeService },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({
              id: "1",
            }),
            snapshot: {
              params: {
                id: "1",
              },
            },
          },
        },
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
