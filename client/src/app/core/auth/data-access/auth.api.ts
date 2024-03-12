import { HttpHeaders } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { HttpService, SingleResponseDto } from "@core/http";
import { AuthResultDto, Credentials } from "@shared/models";
import { Observable, of } from "rxjs";

@Injectable({ providedIn: "root" })
export class AuthApi {
  private readonly _httpService = inject(HttpService);
  login(body: Credentials): Observable<SingleResponseDto<AuthResultDto>> {
    return this._httpService.post("/security/login", body);
  }

  refresh(token: string): Observable<SingleResponseDto<AuthResultDto>> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    });

    return this._httpService.post("/security/refresh", {
      headers,
    });
  }

  logout(): Observable<never> {
    return of();
  }
}
