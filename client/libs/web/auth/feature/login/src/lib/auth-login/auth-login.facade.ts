import { AuthStore } from "@nx/web-auth-data-access";
import {
  signalStore,
  withComputed,
  withMethods,
  withProps,
  withState,
} from "@ngrx/signals";
import { Injectable, computed, inject } from "@angular/core";

export const AuthLoginFacade = signalStore(
  withProps(() => ({
    _authStore: inject(AuthStore),
  })),
  withComputed(({ _authStore }) => ({
    $isPending: computed(() => _authStore.$isLoginPending()),
    $error: computed(() => _authStore.$loginError()),
  })),
  withMethods(({ _authStore }) => ({
    login(username: string, password: string) {
      _authStore.login({ username, password });
    },
  }))
);
