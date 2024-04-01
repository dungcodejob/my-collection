import { Injectable } from "@angular/core";
import { ComponentStore } from "@ngrx/component-store";
import { AuthResultDto } from "./../../../shared/models/auth-result.dto";
import { TokenDto } from "./../../../shared/models/token.dto";
import { UserProfileDto } from "./../../../shared/models/user-profile.dto";

type AuthState = {
  token: TokenDto | null;
  user: UserProfileDto | null;
};

export const initialState: AuthState = {
  token: null,
  user: null,
};

@Injectable({ providedIn: "root" })
export class AuthStore extends ComponentStore<AuthState> {
  constructor() {
    super(initialState);
  }

  setAuth = this.updater((state, result: AuthResultDto) => ({
    ...state,
    token: result.tokens,
    user: result.user,
  }));

  setRefreshToken = this.updater((state, token: TokenDto) => ({
    ...state,
    token,
  }));

  clear = () => this.patchState(initialState);
}
