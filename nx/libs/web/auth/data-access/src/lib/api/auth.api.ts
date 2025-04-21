import { HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { SingleResponseDto } from "@nx/web-shared-http";
import { AuthResultDto, Credentials } from "@nx/web-shared-models";
import { Observable, of } from "rxjs";
import { BaseApi } from "@nx/web-shared-api";


type AuthResponse = SingleResponseDto<AuthResultDto>;

@Injectable({ providedIn: "root" })
export class AuthApi extends BaseApi {

  login(body: Credentials): Observable<AuthResponse> {
    return this._http.post<AuthResponse>(
      this._config.baseUrl + "/security/login",
      body,
      this._options
    );
  }

  refresh(token: string): Observable<AuthResponse> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    });

    return this._http.post<AuthResponse>("/security/refresh", null, {
      headers,
    });
  }

  logout(): Observable<never> {
    return of();
  }

}
