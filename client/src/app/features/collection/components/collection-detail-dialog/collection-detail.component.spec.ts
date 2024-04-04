import { ComponentFixture, TestBed } from "@angular/core/testing";

import { CollectionDetailDialogComponent } from "./collection-detail-dialog.component";

describe("CollectionDetailComponent", () => {
  let component: CollectionDetailDialogComponent;
  let fixture: ComponentFixture<CollectionDetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectionDetailDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CollectionDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
