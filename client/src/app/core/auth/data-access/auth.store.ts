import { inject } from "@angular/core";
import { SingleResponseDto } from "@core/http";
import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { setError, setFulfilled, setPending, withStatus } from "@shared/data-access";
import { Credentials } from "@shared/models";
import { catchError, map, pipe, switchMap, tap, throwError } from "rxjs";
import { AuthResultDto } from "../../../shared/models/auth/auth-result.dto";
import { TokenDto } from "../../../shared/models/auth/token.dto";
import { UserProfileDto } from "../../../shared/models/user/user-profile.dto";
import { AuthApi } from "./auth.api";

interface AuthState {
  token: TokenDto | null;
  user: UserProfileDto | null;
  authenticationHandled: boolean;
}

export const initialState: AuthState = {
  token: null,
  user: null,
  authenticationHandled: false,
};

// @Injectable({ providedIn: "root" })
// export class AuthStore extends ComponentStore<AuthState> {
//   constructor() {
//     super(initialState);
//   }

//   setAuth = this.updater((state, result: AuthResultDto) => ({
//     ...state,
//     token: result.tokens,
//     user: result.user,
//   }));

//   setRefreshToken = this.updater((state, token: TokenDto) => ({
//     ...state,
//     token,
//   }));

//   clear = () => this.patchState(initialState);
// }

enum ApiToken {
  login = "login",
  refresh = "refresh",
}

export const AuthStore = signalStore(
  { providedIn: "root" },
  withState<AuthState>(initialState),
  withStatus({ name: ApiToken.login }),
  withStatus({ name: ApiToken.refresh }),
  withMethods(store => {
    const authApi = inject(AuthApi);

    const authenticationHandle = (name: ApiToken) => {
      patchState(store, setPending(name));
      return pipe(
        map((res: SingleResponseDto<AuthResultDto>) => res.result.data),
        tap(result =>
          patchState(
            store,
            {
              user: result.user,
              token: result.tokens,
              authenticationHandled: true,
            },
            setFulfilled(name)
          )
        ),
        catchError(error => {
          patchState(
            store,
            {
              user: null,
              token: null,
              authenticationHandled: false,
            },
            setError(error, "login")
          );
          return throwError(() => error);
        })
      );
    };
    // const syncToLocal = () => {
    //      storageService.setObject(LocalStorageKeys.User, store.user());
    //       storageService.setObject(LocalStorageKeys.Token, store.token());
    // }
    return {
      login: rxMethod<Credentials>(
        pipe(
          switchMap(body =>
            authApi.login(body).pipe(authenticationHandle(ApiToken.login))
          )
        )
      ),
      refresh: rxMethod<string>(
        pipe(
          switchMap(token =>
            authApi.refresh(token).pipe(authenticationHandle(ApiToken.refresh))
          )
        )
      ),
      clear: () => {
        patchState(store, { token: null, user: null, authenticationHandled: true });
      },
    };
  })
);
