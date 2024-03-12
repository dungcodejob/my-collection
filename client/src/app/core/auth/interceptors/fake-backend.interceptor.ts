import {
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from "@angular/common/http";
import { inject } from "@angular/core";
import { Credentials } from "@shared/models";
import { delay, of, switchMap } from "rxjs";
import { AuthMockApi } from "../data-access/auth-mock.api";

export const fakeBackendInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authApi = inject(AuthMockApi);

  const { url, method, body } = req;

  switch (true) {
    case url.endsWith("/security/login") && method === "POST":
      return authApi.login(body as Credentials).pipe(switchMap(res => ok(res)));
    case url.endsWith("/security/refresh") && method === "POST":
      return authApi.refresh("fake").pipe(switchMap(res => ok(res)));
    // case url.endsWith("/security/refresh") && method === "POST":
    //   return authApi.refresh("fake").pipe(switchMap(() => error()));
    default:
      return next(req);
  }

  function ok<T>(body?: T) {
    return of(new HttpResponse({ status: 200, body })).pipe(delay(500)); // delay observable to simulate server api call
  }

  function error() {
    return of(new HttpResponse({ status: 401 })).pipe(delay(500)); // delay observable to simulate server api call
  }
};
