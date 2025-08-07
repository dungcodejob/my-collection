import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MCCollectionList } from "./collection-list";

describe("MCCollectionList", () => {
  let component: MCCollectionList;
  let fixture: ComponentFixture<MCCollectionList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MCCollectionList],
    }).compileComponents();

    fixture = TestBed.createComponent(MCCollectionList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
