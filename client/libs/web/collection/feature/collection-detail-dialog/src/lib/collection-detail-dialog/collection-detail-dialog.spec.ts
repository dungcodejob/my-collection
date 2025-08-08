import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MCCollectionDetailDialog } from "./collection-detail-dialog";

describe("MCCollectionDetailDialog", () => {
  let component: MCCollectionDetailDialog;
  let fixture: ComponentFixture<MCCollectionDetailDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MCCollectionDetailDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(MCCollectionDetailDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
