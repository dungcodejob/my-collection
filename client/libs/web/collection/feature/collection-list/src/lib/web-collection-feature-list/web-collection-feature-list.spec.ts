import { ComponentFixture, TestBed } from "@angular/core/testing";
import { WebCollectionFeatureList } from "./web-collection-feature-list";

describe("WebCollectionFeatureList", () => {
  let component: WebCollectionFeatureList;
  let fixture: ComponentFixture<WebCollectionFeatureList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebCollectionFeatureList],
    }).compileComponents();

    fixture = TestBed.createComponent(WebCollectionFeatureList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
