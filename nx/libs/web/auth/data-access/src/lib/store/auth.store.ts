import { Injector, computed, effect, inject } from "@angular/core";
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withProps,
  withState,
} from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import {
  AuthResultDto,
  Credentials,
  TokenDto,
  UserProfileDto,
} from "@nx/web-shared-models";
import { withStatus, setPending, setFulfilled, setError } from "@nx/web-shared-utils";
import { catchError, filter, map, pipe, switchMap, take, tap, throwError } from "rxjs";
import { AuthApi } from "../api/auth.api";
import { SingleResponseDto } from "@nx/web-shared-http";
import { LocalStorageService, RedirectService } from "@nx/web-shared-services";
import { toObservable } from "@angular/core/rxjs-interop";

interface AuthState {
  tokens: TokenDto | null;
  user: UserProfileDto | null;
  isAuthenticationHandled: boolean;
}

const initialState: AuthState = {
  tokens: null,
  user: null,
  isAuthenticationHandled: false,
};

enum ApiToken {
  login = "login",
  refresh = "refresh",
}

export const AuthStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withStatus({ name: ApiToken.login }),
  withStatus({ name: ApiToken.refresh }),
  withProps(() => ({
    _authApi: inject(AuthApi),
    _storageService: inject(LocalStorageService),
    _redirectService: inject(RedirectService),
    _injector: inject(Injector),
  })),
  withComputed(store => ({
    $isLoggedIn: computed(() => !!store.tokens()),
    $isAuthenticationHandled: computed(() => store.isAuthenticationHandled()),
    $user: computed(() => store.user()),
    $tokens: computed(() => store.tokens()),
  })),
  withMethods(({ _redirectService, _authApi, ...store }) => {
    const authenticationHandle = (name: ApiToken) => {
      patchState(store, setPending(name));
      return pipe(
        map((res: SingleResponseDto<AuthResultDto>) => res.result.data),
        tap(result => {
          patchState(store, result, setFulfilled(name));
        }),
        catchError(error => {
          patchState(store, initialState, setError(error, name));
          return throwError(() => error);
        })
      );
    };

    return {
      login: rxMethod<Credentials>(
        pipe(
          switchMap(credentials =>
            _authApi.login(credentials).pipe(authenticationHandle(ApiToken.login))
          )
        )
      ),
      refresh: rxMethod<string>(
        pipe(
          switchMap(token =>
            _authApi.refresh(token).pipe(authenticationHandle(ApiToken.refresh))
          )
        )
      ),
      logout: () => {
        patchState(store, { ...initialState, isAuthenticationHandled: true });
        _redirectService.redirectToLogin();
      },
    };
  }),
  withMethods(({ _redirectService, _authApi, _storageService, _injector, ...store }) => {
    const localUser = _storageService.use<UserProfileDto>("user");
    const localTokens = _storageService.use<TokenDto>("tokens");

    const verifyAuth = () => {
      const user = localUser.get();
      const tokens = localTokens.get();

      if (!user || !tokens) {
        store.logout();
      }
    };

    const refreshToken = () => {
      const tokens = store.tokens();
      if (tokens) {
        store.refresh(tokens.refresh);
      }
    };

    const registerSyncAuthToLocalEffect = () => {
      effect(
        () => {
          const user = store.user();
          const tokens = store.tokens();

          localUser.set(user);
          localTokens.set(tokens);
        },
        { injector: _injector }
      );
    };

    const registerAfterLoggedInEffect = () => {
      effect(
        () => {
          if (store.$isLoggedIn()) {
            _redirectService.redirectToPreviousUrl();
          }
        },
        { injector: _injector }
      );
    };

    const registerAuthFailedEffect = () => {
      effect(
        () => {
          const isLoginFailed = store.$loginError() !== null;
          const isRefreshFailed = store.$refreshError() !== null;
          if (isLoginFailed || isRefreshFailed) {
            store.logout();
          }
        },
        { injector: _injector }
      );
    };
    return {
      initializer() {
        verifyAuth();
        refreshToken();
        registerSyncAuthToLocalEffect();
        registerAuthFailedEffect();
        registerAfterLoggedInEffect();

        return toObservable(store.isAuthenticationHandled, { injector: _injector }).pipe(
          filter(Boolean),
          take(1)
        );
      },
    };
  })
);
