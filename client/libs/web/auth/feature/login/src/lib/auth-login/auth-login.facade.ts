import { computed, inject } from "@angular/core";
import { AuthStore, authEvents } from "@client/web-auth-data-access";
import { signalStore, withComputed, withMethods, withProps } from "@ngrx/signals";
import { injectDispatch } from "@ngrx/signals/events";

export const AuthLoginFacade = signalStore(
  withProps(() => ({
    _authStore: inject(AuthStore),
    _dispatch: injectDispatch(authEvents),
  })),
  withComputed(({ _authStore }) => ({
    $isPending: computed(() => _authStore.$isLoginPending()),
    $error: computed(() => _authStore.$loginError()),
  })),
  withMethods(({ _authStore, _dispatch }) => ({
    login: _dispatch.login,
  }))
);
