import { Injectable, inject } from "@angular/core";
import { Router } from "@angular/router";
import { SingleResponseDto } from "@core/http";
import { LocalStorageKeys } from "@shared/enums";
import { AuthResultDto, Credentials, TokenDto, UserProfileDto } from "@shared/models";
import { LocalStorageService } from "@shared/services";
import { Observable, catchError, map, of, pipe, switchMap, take, tap } from "rxjs";
import { AuthApi } from "./auth.api";
import { AuthStore } from "./auth.store";

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly _authApi = inject(AuthApi);
  private readonly _authStore = inject(AuthStore);
  private readonly _storageService = inject(LocalStorageService);
  private readonly _router = inject(Router);

  readonly token$ = this._authStore.select(state => state.token);
  readonly isLoggedIn$ = this._authStore.select(state => !!state.token, {
    debounce: false,
  });

  readonly $token = this._authStore.selectSignal(state => state.token);

  constructor() {}

  initializer() {
    const tokens = this._storageService.getObject<TokenDto>(LocalStorageKeys.Token);
    const user = this._storageService.getObject<UserProfileDto>(LocalStorageKeys.User);

    if (!tokens || !user) {
      return this.logout();
    }

    return this.refresh(tokens.refresh).pipe(
      switchMap(() => this.isLoggedIn$),
      take(1)
    );
  }

  login(body: Credentials): Observable<AuthResultDto> {
    return this._authApi.login(body).pipe(this._afterAuthentication());
  }

  refresh(token: string): Observable<AuthResultDto> {
    return this._authApi.refresh(token).pipe(
      catchError(err => this.logout()),
      this._afterAuthentication()
    );
  }

  logout(): Observable<never> {
    this._clearLocalAuth();
    this._authStore.clear();
    this._router.navigate(["/security/login"]);
    return of();
  }

  private _afterAuthentication() {
    return pipe(
      map((res: SingleResponseDto<AuthResultDto>) => res.result.data),
      tap(result => {
        this._authStore.setAuth(result);
        this._setAuthToLocal(result);
        this._router.navigate([
          "home",
          { outlets: { primary: ["test"], sidebar: ["collection"] } },
        ]);
      })
    );
  }

  private _setAuthToLocal({ user, tokens }: AuthResultDto) {
    this._storageService.setObject(LocalStorageKeys.User, user);
    this._storageService.setObject(LocalStorageKeys.Token, tokens);
  }
  private _clearLocalAuth() {
    this._storageService.remove(LocalStorageKeys.Token);
    this._storageService.remove(LocalStorageKeys.User);
  }
}
