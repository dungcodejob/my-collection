import { Request } from "express";
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withProps,
  withState,
} from "@ngrx/signals";
import {
  AuthResultDto,
  Credentials,
  TokenDto,
  UserProfileDto,
} from "@nx/web-shared-models";
import { AuthApi } from "../api/auth.api";
import { inject } from "@angular/core";
import { rxResource } from "@angular/core/rxjs-interop";
import { of, switchMap, tap, throwError } from "rxjs";
interface AuthState {
  credentials: Credentials | null;
  refreshToken: string | null;
}

const initialState: AuthState = {
  credentials: null,
  refreshToken: null,
};

export const AuthStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withProps(() => ({
    _authApi: inject(AuthApi),
  })),
  withProps(({ _authApi, ...store }) => ({
    loginResource: rxResource<AuthResultDto | null, Credentials | null>({
      request: () => store.credentials(),
      loader: params => {
        if (params.request) {
          return _authApi.login(params.request).pipe(
            switchMap(res => {
              if (res.success) {
                return of(res.result.data);
              } else {
                return throwError(() => new Error(res.message));
              }
            })
          );
        }

        return of(null);
      },
    }),
  })),
  withProps(({ _authApi, loginResource, ...store }) => ({
    refreshResource: rxResource<AuthResultDto | null, string | null>({
      request: () => store.refreshToken(),
      loader: params => {
        if (params.request) {
          return _authApi.refresh(params.request).pipe(
            switchMap(res => {
              if (res.success) {
                return of(res.result.data);
              } else {
                return throwError(() => new Error(res.message));
              }
            }),
            tap(results => loginResource.set(results))
          );
        }

        return of(null);
      },
    }),
  })),
  withMethods(store => {
    return {
      login(credentials: Credentials) {
        patchState(store, { credentials });
      },
    };
  })
);
