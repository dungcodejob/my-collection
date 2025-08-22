import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MCBookmarkList } from "./bookmark-list";

describe("BookmarkList", () => {
  let component: MCBookmarkList;
  let fixture: ComponentFixture<MCBookmarkList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MCBookmarkList],
    }).compileComponents();

    fixture = TestBed.createComponent(MCBookmarkList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
