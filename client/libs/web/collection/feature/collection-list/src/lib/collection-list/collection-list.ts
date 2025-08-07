import { Component, inject, OnInit } from "@angular/core";
import { Collection } from "@client/web-collection-data-access";
import { MCCollectionTree } from "@client/web-collection-ui-tree";
import { MCCollectionListFacade } from "./collection-list.facade";

@Component({
  selector: "mc-collection-list",
  imports: [MCCollectionTree],
  providers: [MCCollectionListFacade],
  templateUrl: "./collection-list.html",
  styleUrl: "./collection-list.css",
})
export class MCCollectionList implements OnInit {
  protected readonly facade = inject(MCCollectionListFacade);

  ngOnInit(): void {
    const root = this.facade.$root();
    this.facade.load({ filter: { path: root.path, currentPage: 1, pageSize: 10 } });
  }

  onNodeExpand(node: Collection): void {
    this.facade.load({ filter: { path: node.path, currentPage: 1, pageSize: 10 } });
  }
}
