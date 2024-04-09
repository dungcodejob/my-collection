import { ComponentFixture, TestBed } from "@angular/core/testing";

import { BookmarkDetailDialogComponent } from "./bookmark-detail-dialog.component";

describe("BookmarkDetailDialogComponent", () => {
  let component: BookmarkDetailDialogComponent;
  let fixture: ComponentFixture<BookmarkDetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookmarkDetailDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BookmarkDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
