import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AddBookmarkDialog } from "./add-bookmark-dialog";

describe("AddBookmarkDialog", () => {
  let component: AddBookmarkDialog;
  let fixture: ComponentFixture<AddBookmarkDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddBookmarkDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(AddBookmarkDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
