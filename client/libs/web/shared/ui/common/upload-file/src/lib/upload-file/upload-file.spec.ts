import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MCUploadFile } from "./upload-file";

describe("WebSharedUiUploadFile", () => {
  let component: MCUploadFile;
  let fixture: ComponentFixture<MCUploadFile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MCUploadFile],
    }).compileComponents();

    fixture = TestBed.createComponent(MCUploadFile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
