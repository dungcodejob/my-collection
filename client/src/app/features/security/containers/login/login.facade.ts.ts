import { Injectable, inject } from "@angular/core";
import { Credentials } from "@shared/models";
import { SecurityStore } from "../../data-access";

@Injectable()
export class LoginFacade {
  private readonly _securityStore = inject(SecurityStore);

  $error = this._securityStore.selectSignal(state =>
    state.mode === "login" ? state.error : null
  );

  $loading = this._securityStore.selectSignal(
    state => state.mode === "login" && state.status === "fetching"
  );

  $vm = this._securityStore.selectSignal(
    this.$error,
    this.$loading,
    (error, loading) => ({ error, loading })
  );

  constructor() {}

  enter(): void {
    this._securityStore.setMode("login");
  }

  login(body: Credentials): void {
    this._securityStore.login(body);
  }
}
