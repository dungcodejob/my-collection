import { Injectable, inject } from "@angular/core";
import { debouncedSignal } from "@shared/utils";
import { ShellStore } from "@shell/data-access";

@Injectable()
export class ShellFacade {
  private readonly _layoutStore = inject(ShellStore);

  $loading = debouncedSignal(this._layoutStore.loading, 200);

  setLoading = this._layoutStore.setLoading;
  showLoading = this._layoutStore.showLoading;
  hideLoading = this._layoutStore.hideLoading;

  constructor() {}
}
