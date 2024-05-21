import { Injectable, inject } from "@angular/core";
import { AuthService } from "@core/auth";
import { Credentials } from "@shared/models";

@Injectable()
export class LoginFacade {
  private readonly _authFacade = inject(AuthService);

  readonly $isPending = this._authFacade.$isLoginLoading;
  readonly $error = this._authFacade.$loginError;

  constructor() {}

  enter(): void {}

  login(body: Credentials): void {
    this._authFacade.login(body);
  }
}
