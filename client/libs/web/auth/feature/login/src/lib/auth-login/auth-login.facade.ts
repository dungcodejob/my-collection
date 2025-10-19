import { computed, inject } from "@angular/core";
import { AuthStore } from "@client/web-auth-data-access";
import { signalStore, withComputed, withMethods, withProps } from "@ngrx/signals";

export const AuthLoginFacade = signalStore(
  withProps(() => ({
    _authStore: inject(AuthStore),
  })),
  withComputed(({ _authStore }) => ({
    $isPending: computed(() => _authStore.$isLoginPending()),
    $error: computed(() => _authStore.$loginError()),
  })),
  withMethods(({ _authStore }) => ({
    login: _authStore.login,
  }))
);
