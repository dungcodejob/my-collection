import { Injectable, inject } from "@angular/core";
import { debouncedSignal } from "@shared/utils";
import { RootStore } from "./root.store";

@Injectable()
export class RootFacade {
  private readonly _layoutStore = inject(RootStore);

  $loading = debouncedSignal(this._layoutStore.loading, 200);

  setLoading = this._layoutStore.setLoading;
  showLoading = this._layoutStore.showLoading;
  hideLoading = this._layoutStore.hideLoading;

  constructor() {}
}
