import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { CollectionTreeService } from "../collection-tree/collection-tree.service";
import { MCCollectionNode } from "./collection-node";
describe("MCCollectionNode", () => {
  let component: MCCollectionNode;
  let fixture: ComponentFixture<MCCollectionNode>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MCCollectionNode],
      providers: [provideAnimationsAsync(), CollectionTreeService],
    }).compileComponents();

    fixture = TestBed.createComponent(MCCollectionNode);
    component = fixture.componentInstance;

    const componentRef = fixture.componentRef;
    componentRef.setInput("node", { id: "1", name: "root" });

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
