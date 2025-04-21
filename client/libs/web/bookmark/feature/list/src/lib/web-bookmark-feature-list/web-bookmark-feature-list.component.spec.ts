import { ComponentFixture, TestBed } from "@angular/core/testing";
import { WebBookmarkFeatureListComponent } from "./web-bookmark-feature-list.component";

describe("WebBookmarkFeatureListComponent", () => {
  let component: WebBookmarkFeatureListComponent;
  let fixture: ComponentFixture<WebBookmarkFeatureListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebBookmarkFeatureListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WebBookmarkFeatureListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
