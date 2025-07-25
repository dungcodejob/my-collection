import {
  NamedStatusState,
  setError,
  setFulfilled,
  setPending,
} from "@client/web-shared-utils";
import { signalStoreFeature, type } from "@ngrx/signals";
import { on, withReducer } from "@ngrx/signals/events";
import { authApiEvents, authEvents } from "./auth.event";
import { AuthApiToken, AuthState } from "./auth.store";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function withAuthReducer() {
  return signalStoreFeature(
    {
      state: type<
        AuthState &
          NamedStatusState<AuthApiToken.login> &
          NamedStatusState<AuthApiToken.refresh>
      >(),
    },
    withReducer(
      on(authEvents.logout, () => ({
        tokens: null,
        isInitialized: true,
      })),
      on(authEvents.refreshToken, () => ({
        ...setPending(AuthApiToken.refresh),
      })),
      on(authApiEvents.refreshTokenSuccess, ({ payload }) => ({
        tokens: payload.tokens,
        isInitialized: true,
        ...setFulfilled(AuthApiToken.refresh),
      })),
      on(authApiEvents.refreshTokenFailure, ({ payload }) => ({
        tokens: null,
        isInitialized: true,
        ...setError(AuthApiToken.refresh, payload.error),
      })),
      on(authEvents.login, () => ({
        ...setPending(AuthApiToken.login),
      })),
      on(authApiEvents.loginSuccess, ({ payload }) => ({
        tokens: payload.tokens,
        isInitialized: true,
        ...setFulfilled(AuthApiToken.login),
      })),
      on(authApiEvents.loginFailure, ({ payload }) => ({
        tokens: null,
        isInitialized: true,
        ...setError(AuthApiToken.login, payload.error),
      }))
    )
  );
}
