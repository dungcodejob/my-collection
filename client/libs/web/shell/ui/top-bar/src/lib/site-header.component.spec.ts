import { ComponentFixture, TestBed } from "@angular/core/testing";
import { SiteHeaderComponent } from "./site-header.component";

describe("SiteHeaderComponent", () => {
  let component: SiteHeaderComponent;
  let fixture: ComponentFixture<SiteHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteHeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SiteHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
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

  it("should render theme toggle component", () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const themeToggle = compiled.querySelector("mc-theme-toggle");
    expect(themeToggle).toBeTruthy();
  });
});
