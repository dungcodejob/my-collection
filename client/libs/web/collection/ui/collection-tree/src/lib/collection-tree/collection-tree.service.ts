import { Injectable, signal } from "@angular/core";
import { Collection } from "@client/web-collection-data-access";

@Injectable()
export class CollectionTreeService {
  private readonly _$expandedNode = signal<Collection | undefined>(undefined);

  readonly $expandedNode = this._$expandedNode.asReadonly();

  expand(node: Collection): void {
    this._$expandedNode.set(node);
  }
}
