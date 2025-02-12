import { inject } from "@angular/core";
import { signalStore, withMethods, withProps, withState } from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { Credentials, TokenDto, UserProfileDto } from "@nx/web-shared-models";
import { withStatus } from "@nx/web-shared-utils";
import { pipe, switchMap } from "rxjs";
import { AuthApi } from "../api/auth.api";
interface AuthState {
  user: UserProfileDto | null;
  tokens: TokenDto | null;
}

const initialState: AuthState = {
  user: null,
  tokens: null,
};

export const AuthStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withStatus(),
  withProps(() => ({
    _authApi: inject(AuthApi),
  })),
  withMethods(store => {
    return {
      login: rxMethod<Credentials>(
        pipe(switchMap(credentials => store._authApi.login(credentials).pipe()))
      ),
    };
  })
);
