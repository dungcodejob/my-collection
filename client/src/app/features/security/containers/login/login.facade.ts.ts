import { Injectable, inject } from "@angular/core";
import { Credentials } from "@shared/models";
import { LoginStore } from "../../data-access";

@Injectable()
export class LoginFacade {
  private readonly _loginStore = inject(LoginStore);

  readonly $error = this._loginStore.$error;
  readonly $isPending = this._loginStore.$isPending;

  constructor() {}

  enter(): void {}

  login(body: Credentials): void {
    this._loginStore.login(body);
  }
}
