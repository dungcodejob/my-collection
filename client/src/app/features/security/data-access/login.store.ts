import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "@core/auth";
import { ServerSideError } from "@core/http";
import { patchState, signalStore, withMethods } from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { setError, setPending, withStatus } from "@shared/data-access";
import { Credentials } from "@shared/models";
import { EMPTY, catchError, pipe, switchMap, tap } from "rxjs";

export const LoginStore = signalStore(
  withStatus(),
  withMethods(store => {
    const authService = inject(AuthService);
    const router = inject(Router);
    return {
      login: rxMethod<Credentials>(
        pipe(
          tap(() => patchState(store, setPending())),
          switchMap(body =>
            authService.login(body).pipe(
              tap({
                next: () => {
                  router.navigate(["/"]);
                  patchState(store, {});
                },
                error: err => {
                  if (err instanceof ServerSideError) {
                    patchState(store, setError(err));
                  }
                },
              }),
              catchError(() => EMPTY)
            )
          )
        )
      ),
    };
  })
);
