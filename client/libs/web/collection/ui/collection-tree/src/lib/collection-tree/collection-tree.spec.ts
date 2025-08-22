import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { MCCollectionTree } from "./collection-tree";
describe("MCCollectionTree", () => {
  let component: MCCollectionTree;
  let fixture: ComponentFixture<MCCollectionTree>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MCCollectionTree],
      providers: [provideAnimationsAsync()],
    }).compileComponents();

    fixture = TestBed.createComponent(MCCollectionTree);
    component = fixture.componentInstance;

    const componentRef = fixture.componentRef;
    componentRef.setInput("node", { id: "1", name: "root" });
    componentRef.setInput("tree", { "1": [{ id: "2", name: "child" }] });

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
