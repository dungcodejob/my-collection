import { inject, Injectable } from "@angular/core";
import { AppFacade, CollectionFacade } from "@shared/data-access";

@Injectable()
export class HomeShellFacade {
  private readonly _collectionFacade = inject(CollectionFacade);
  private readonly _rootFacade = inject(AppFacade);

  $loading = this._rootFacade.$loading;

  enter() {
    this._collectionFacade.enter();
  }
}
