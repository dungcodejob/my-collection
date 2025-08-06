import { ComponentFixture, TestBed } from "@angular/core/testing";
import { WebCollectionUiTree } from "./collection-tree";

describe("WebCollectionUiTree", () => {
  let component: WebCollectionUiTree;
  let fixture: ComponentFixture<WebCollectionUiTree>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebCollectionUiTree],
    }).compileComponents();

    fixture = TestBed.createComponent(WebCollectionUiTree);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
