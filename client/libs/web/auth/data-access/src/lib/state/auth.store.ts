import { computed } from "@angular/core";
import { withStatus } from "@client/web-shared-utils";
import { signalStore, withComputed, withState } from "@ngrx/signals";
import { AuthTokens } from "../models/auth-tokens";

export type AuthState = {
  tokens: AuthTokens | null;
  isInitialized: boolean;
};

export const authInitialState: AuthState = {
  tokens: null,
  isInitialized: false,
};

export enum AuthApiToken {
  login = "login",
  refresh = "refresh",
}

export const AuthStore = signalStore(
  { providedIn: "root" },
  withState<AuthState>(authInitialState),
  withStatus({ name: AuthApiToken.login }),
  withStatus({ name: AuthApiToken.refresh }),
  withComputed(store => {
    return {
      isAuthenticated: computed(() => !!store.tokens()),
    };
  })
);
