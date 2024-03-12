import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpStatusCode,
} from "@angular/common/http";
import { inject } from "@angular/core";
import {
  Observable,
  catchError,
  filter,
  finalize,
  switchMap,
  take,
  throwError,
} from "rxjs";
import { AuthService } from "../data-access/auth.service";

export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);
  const refreshToken$ = authService.token$;
  const token = authService.$token();
  const exceptions = ["/login", "/refresh-token", "assets"];
  let refreshing = false;

  const addTokenToRequest = (
    request: HttpRequest<unknown>,
    next: HttpHandlerFn,
    accessToken: string
  ): Observable<HttpEvent<unknown>> => {
    const headers = request.headers.set("Authorization", `Bearer ${accessToken}`);
    const requestClone = request.clone({ headers });

    return next(requestClone);
  };

  const handle401Error = (
    request: HttpRequest<unknown>,
    next: HttpHandlerFn,
    refreshToken: string,
    error: HttpErrorResponse
  ) => {
    if (!refreshing) {
      refreshing = true;

      return authService.refresh(refreshToken).pipe(
        catchError(() => {
          authService.logout();
          return throwError(() => error);
        }),
        finalize(() => (refreshing = false)),
        switchMap(results => {
          return addTokenToRequest(request, next, results.tokens.access);
        })
      );
    } else {
      return refreshToken$.pipe(
        filter(Boolean),
        take(1),
        switchMap(value => addTokenToRequest(request, next, value.access))
      );
    }
  };

  if (!token) {
    return next(request);
  }

  if (exceptions.some(d => request.url.includes(d))) {
    return next(request);
  }

  if (request.headers.has("Authorization")) {
    return next(request);
  }

  return addTokenToRequest(request, next, token.access).pipe(
    catchError(error => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === HttpStatusCode.Unauthorized &&
        !exceptions.some(d => request.url.includes(d))
      ) {
        if (!token.refresh) {
          return throwError(() => error);
        }

        return handle401Error(request, next, token.refresh, error);
      } else {
        return throwError(() => error);
      }
    })
  );
};
