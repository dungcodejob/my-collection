import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_ENDPOINTS } from "@client/web-shared-constants";
import { Observable } from "rxjs";
import { AuthTokens, LoginCredentials } from "../models";

@Injectable({
  providedIn: "root",
})
export class AuthApi {
  private readonly _http = inject(HttpClient);

  login(credentials: LoginCredentials): Observable<AuthTokens> {
    return this._http.post<AuthTokens>(API_ENDPOINTS.AUTH.LOGIN, credentials);
  }

  refresh(refreshToken: string): Observable<AuthTokens> {
    return this._http.post<AuthTokens>(API_ENDPOINTS.AUTH.REFRESH, { refreshToken });
  }

  logout(refreshToken: string): Observable<void> {
    return this._http.post<void>(API_ENDPOINTS.AUTH.LOGOUT, { refreshToken });
  }
}
