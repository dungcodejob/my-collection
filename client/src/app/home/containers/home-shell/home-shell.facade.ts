import { inject, Injectable } from "@angular/core";
import { CollectionFacade } from "@collection/data-access";
import { RootFacade, TagFacade } from "@shared/data-access";

@Injectable()
export class HomeShellFacade {
  private readonly _collectionFacade = inject(CollectionFacade);
  private readonly _tagFacade = inject(TagFacade);
  private readonly _rootFacade = inject(RootFacade);

  $loading = this._rootFacade.$loading;

  enter() {
    this._collectionFacade.enter();
    this._tagFacade.enter();
  }
}
