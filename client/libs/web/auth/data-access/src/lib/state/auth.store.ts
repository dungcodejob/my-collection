import { computed, effect, inject, Injector, untracked } from "@angular/core";
import { tapHandleApi } from "@client/web-core-http";
import { RedirectService, StorageService } from "@client/web-shared-services";
import { setStatus, withStatus } from "@client/web-shared-utils";
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { Observable, of, switchMap } from "rxjs";
import { LoginCredentials } from "../models";
import { AuthTokens } from "../models/auth-tokens";
import { AuthApi } from "./auth.api";

export type AuthState = {
  tokens: AuthTokens | null;
  isSynchronized: boolean;
  isInitialized: boolean;
  isTokenExpired: boolean;
};

export const authInitialState: AuthState = {
  tokens: null,
  isSynchronized: false,
  isInitialized: false,
  isTokenExpired: false,
};

export const authStatusNames = {
  login: "login",
  refresh: "refresh",
  logout: "logout",
} as const;

export const AuthStore = signalStore(
  { providedIn: "root" },
  withState(authInitialState),
  withStatus({
    names: [authStatusNames.refresh, authStatusNames.login, authStatusNames.logout],
  }),
  withComputed(store => {
    return {
      isAuthenticated: computed(() => !!store.tokens()),
    };
  }),
  withMethods(
    (
      store,
      _storage = inject(StorageService),
      _redirectService = inject(RedirectService),
      _injector = inject(Injector),
      _authApi = _injector.get(AuthApi)
    ) => {
      const storageTokens = _storage.use<AuthTokens>("auth");

      const refresh = rxMethod<AuthTokens>(tokens$ => {
        return tokens$.pipe(
          switchMap(tokens =>
            _authApi.refresh(tokens.refreshToken).pipe(
              tapHandleApi({
                successFn: result =>
                  patchState(store, {
                    tokens: result.data,
                    isTokenExpired: false,
                    isInitialized: true,
                  }),
                errorFn: () => patchState(store, { tokens: null, isInitialized: true }),
                statusFn: status =>
                  patchState(store, setStatus(status, authStatusNames.refresh)),
              })
            )
          )
        );
      });

      const login = rxMethod<LoginCredentials>(credentials$ => {
        return credentials$.pipe(
          switchMap(credentials =>
            _authApi.login(credentials).pipe(
              tapHandleApi({
                successFn: result =>
                  patchState(store, {
                    tokens: result.data,
                    isTokenExpired: false,
                    isInitialized: true,
                  }),
                errorFn: () => patchState(store, { tokens: null, isInitialized: true }),
                statusFn: status =>
                  patchState(store, setStatus(status, authStatusNames.login)),
              })
            )
          )
        );
      });

      const logout = rxMethod<AuthTokens>(tokens$ => {
        return tokens$.pipe(
          switchMap(tokens =>
            _authApi.logout(tokens.refreshToken).pipe(
              tapHandleApi({
                successFn: () => patchState(store, { tokens: null, isInitialized: true }),
                errorFn: () => patchState(store, { tokens: null, isInitialized: true }),
                statusFn: status =>
                  patchState(store, setStatus(status, authStatusNames.logout)),
              })
            )
          )
        );
      });

      const syncTokenToLocal = (): void => {
        const localTokens = storageTokens.get();
        patchState(store, { tokens: localTokens, isSynchronized: true });

        effect(
          () => {
            const tokens = store.tokens();
            storageTokens.set(tokens);
          },
          { injector: _injector }
        );
      };

      const loadTokens = (): void => {
        effect(
          () => {
            const isSynchronized = store.isSynchronized();
            if (isSynchronized) {
              untracked(() => {
                const tokens = store.tokens();
                if (tokens) {
                  refresh(tokens);
                }
              });
            }
          },
          { injector: _injector }
        );
      };

      const redirect = (): void => {
        effect(
          () => {
            const isInitialized = store.isInitialized();
            if (isInitialized) {
              _redirectService.redirectToSavedUrl();
            }
          },
          { injector: _injector }
        );
      };

      const initialize = (): Observable<void> => {
        syncTokenToLocal();
        loadTokens();
        redirect();
        return of(void 0);
      };

      const tokenExpired = (): void => {
        patchState(store, { isTokenExpired: true });
      };

      return {
        login,
        refresh,
        logout,
        initialize,
        tokenExpired,
      };
    }
  )
);
