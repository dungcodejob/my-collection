import { Injectable, inject } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "@core/auth";
import { ServerSideError } from "@core/http";
import { ComponentStore } from "@ngrx/component-store";
import { Credentials } from "@shared/models";
import { EMPTY, catchError, delay, exhaustMap, tap } from "rxjs";

type SecurityState = {
  mode: "login" | "signIn" | null;
  status: "idle" | "fetching" | "successful" | "failed";
  error: string | null;
};

const initial: SecurityState = {
  mode: null,
  status: "idle",
  error: null,
};

@Injectable()
export class SecurityStore extends ComponentStore<SecurityState> {
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);
  constructor() {
    super(initial);
  }

  setMode(mode: SecurityState["mode"]) {
    this.patchState({ mode });
  }

  login = this.effect<Credentials>(body$ => {
    return body$.pipe(
      tap(() => this.setIsLoading()),
      delay(50000),
      exhaustMap(body => this._authService.login(body)),
      tap({
        next: () => {
          this._router.navigate(["/"]);
          this.setLoginSuccess();
        },
        error: err => {
          if (err instanceof ServerSideError) {
            console.log("server side error", err);
          }
        },
      }),
      catchError(() => EMPTY)
    );
  });

  setIsLoading() {
    this.patchState({ status: "fetching" });
  }
  setLoginSuccess() {
    this.patchState({ status: "successful" });
  }
  setError(error: string) {
    this.patchState({ status: "failed", error });
  }
}
