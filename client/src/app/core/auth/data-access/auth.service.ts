import { Injectable, Injector, computed, effect, inject } from "@angular/core";
import { toObservable } from "@angular/core/rxjs-interop";
import { LocalStorageKeys } from "@shared/enums";
import { TokenDto, UserProfileDto } from "@shared/models";
import { LocalStorageService, RedirectService } from "@shared/services";
import { filter, take } from "rxjs";
import { AuthStore } from "./auth.store";

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly _injector = inject(Injector);
  private readonly _storageService = inject(LocalStorageService);
  private readonly _redirectService = inject(RedirectService);
  private readonly _authStore = inject(AuthStore);

  readonly $user = this._authStore.user;
  readonly $token = this._authStore.token;
  readonly $isLoggedIn = computed(() => !!this._authStore.token());

  readonly $isLoginLoading = this._authStore.$isLoginPending;
  readonly $loginError = this._authStore.$loginError;
  readonly $isRefreshLoading = this._authStore.$isRefreshPending;
  readonly $refreshError = this._authStore.$refreshError;

  initializer() {
    const tokens = this._storageService.getObject<TokenDto>(LocalStorageKeys.Token);
    const user = this._storageService.getObject<UserProfileDto>(LocalStorageKeys.User);

    if (!tokens || !user) {
      this.logout();
    } else {
      this.refresh(tokens.refresh);
    }

    this.listen();

    return toObservable(this._authStore.authenticationHandled, {
      injector: this._injector,
    }).pipe(filter(Boolean), take(1));
  }

  listen() {
    effect(
      () => {
        const user = this._authStore.user();
        const tokens = this._authStore.token();
        this._saveAuthToLocal({ user, tokens });
      },
      { injector: this._injector }
    );

    effect(
      () => {
        const isLoginFailed = this._authStore.$loginError() !== null;
        const isRefreshFailed = this._authStore.$refreshError() !== null;
        if (isLoginFailed || isRefreshFailed) {
          this.logout();
        }
      },
      { injector: this._injector }
    );

    effect(
      () => {
        if (this.$isLoggedIn()) {
          this._redirectService.redirectToPreviousUrl();
        }
      },
      { injector: this._injector }
    );
  }

  login = this._authStore.login;
  refresh = this._authStore.refresh;

  logout() {
    this._authStore.clear();
    this._redirectService.redirectToLogin();
  }

  private _saveAuthToLocal(data: {
    user: UserProfileDto | null;
    tokens: TokenDto | null;
  }) {
    this._storageService.setObject(LocalStorageKeys.User, data.user);
    this._storageService.setObject(LocalStorageKeys.Token, data.tokens);
  }
}
