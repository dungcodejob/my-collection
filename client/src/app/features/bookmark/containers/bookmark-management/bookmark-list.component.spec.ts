import { ComponentFixture, TestBed } from "@angular/core/testing";

import { BookmarkListComponent } from "./bookmark-management.component";

describe("BookmarkListComponent", () => {
  let component: BookmarkListComponent;
  let fixture: ComponentFixture<BookmarkListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BookmarkListComponent],
    });
    fixture = TestBed.createComponent(BookmarkListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
