import { Injectable, inject } from "@angular/core";
import { HttpService, SingleResponseDto } from "@core/http";
import { AuthResultDto, Credentials, TokenDto, UserProfileDto } from "@shared/models";
import { Observable, delay, of } from "rxjs";

@Injectable({ providedIn: "root" })
export class AuthMockApi {
  private readonly _httpService = inject(HttpService);

  login(body: Credentials): Observable<SingleResponseDto<AuthResultDto>> {
    const user = this._createFakeUser(body);
    const tokens = this._createFakeToken();
    const res = this._createFakeSingleResponse({ user, tokens }, "POST");

    return of(res).pipe(delay(2000));
  }

  refresh(token: string): Observable<SingleResponseDto<AuthResultDto>> {
    const user = this._createFakeUser({ username: "test", password: "test" });
    const tokens = this._createFakeToken();
    tokens.refresh = token;
    const res = this._createFakeSingleResponse({ user, tokens }, "POST");
    return of(res).pipe();
  }

  logout(): Observable<never> {
    return of();
  }

  private _createFakeSingleResponse<T>(
    data: T,
    method: "GET" | "PUT" | "POST" | "DELETE"
  ): SingleResponseDto<T> {
    return {
      statusCode: 200,
      success: true,
      message: "Fake success message",
      timestamp: new Date().toISOString(),
      result: {
        data: data,
      },
      url: "https://example.com/api",
      method: method,
    };
  }

  private _createFakeUser(body: Credentials): UserProfileDto {
    return {
      email: body.username,
      firstName: "John",
      lastName: "Doe",
      id: "123456789",
      updateAt: new Date().toISOString(),
      createAt: new Date().toISOString(),
    };
  }

  private _createFakeToken(): TokenDto {
    return {
      access: "fakeAccessToken",
      refresh: "fakeRefreshToken",
    };
  }
}
