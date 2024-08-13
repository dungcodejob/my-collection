import { ComponentFixture, TestBed } from "@angular/core/testing";

import { BookmarkTagSelectComponent } from "./bookmark-tag-select.component";

describe("BookmarkTagSelectComponent", () => {
  let component: BookmarkTagSelectComponent;
  let fixture: ComponentFixture<BookmarkTagSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookmarkTagSelectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BookmarkTagSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
