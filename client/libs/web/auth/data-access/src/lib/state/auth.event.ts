import { eventGroup } from "@ngrx/signals/events";

import { type } from "@ngrx/signals";
import { LoginCredentials } from "../models";
import { AuthTokens } from "../models/auth-tokens";

export const authEvents = eventGroup({
  source: "Auth Page",
  events: {
    login: type<{ credentials: LoginCredentials }>(),
    logout: type<void>(),
    refreshToken: type<{ refreshToken: string }>(),
    initializer: type<void>(),
  },
});

export const authApiEvents = eventGroup({
  source: "Auth API",
  events: {
    loginSuccess: type<{ tokens: AuthTokens }>(),
    loginFailure: type<{ error: string }>(),
    refreshTokenSuccess: type<{ tokens: AuthTokens }>(),
    refreshTokenFailure: type<{ error: string }>(),
  },
});
