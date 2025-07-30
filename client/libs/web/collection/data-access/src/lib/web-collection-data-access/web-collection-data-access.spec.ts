import { ComponentFixture, TestBed } from "@angular/core/testing";
import { WebCollectionDataAccess } from "./web-collection-data-access";

describe("WebCollectionDataAccess", () => {
  let component: WebCollectionDataAccess;
  let fixture: ComponentFixture<WebCollectionDataAccess>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebCollectionDataAccess],
    }).compileComponents();

    fixture = TestBed.createComponent(WebCollectionDataAccess);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
