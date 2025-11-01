import { inject, Injectable } from "@angular/core";
import { HttpService, ResponseDto, SingleResponseDto } from "@client/web-core-http";
import { API_ENDPOINTS } from "@client/web-shared-constants";
import { Observable } from "rxjs";
import { AuthTokens, LoginCredentials } from "../models";

@Injectable({
  providedIn: "root",
})
export class AuthApi {
  private readonly _http = inject(HttpService);

  login(credentials: LoginCredentials): Observable<SingleResponseDto<AuthTokens>> {
    return this._http.post<SingleResponseDto<AuthTokens>>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
  }

  refresh(refreshToken: string): Observable<SingleResponseDto<AuthTokens>> {
    return this._http.post<SingleResponseDto<AuthTokens>>(API_ENDPOINTS.AUTH.REFRESH, {
      refreshToken,
    });
  }

  logout(refreshToken: string): Observable<ResponseDto<void>> {
    return this._http.post<ResponseDto<void>>(API_ENDPOINTS.AUTH.LOGOUT, {
      refreshToken,
    });
  }
}
