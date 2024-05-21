import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpStatusCode,
} from "@angular/common/http";
import { inject } from "@angular/core";
import { toObservable } from "@angular/core/rxjs-interop";
import { Observable, catchError, filter, switchMap, take, throwError } from "rxjs";
import { AuthService } from "../data-access/auth.service";

export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);
  const token = authService.$token();
  const exceptions = ["/login", "/refresh-token", "assets"];

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
    const refreshing = authService.$isRefreshLoading();

    if (refreshing) {
      authService.refresh(refreshToken);
    }

    return toObservable(authService.$token).pipe(
      filter(Boolean),
      filter(() => !refreshing),
      take(1),
      switchMap(value => addTokenToRequest(request, next, value.access)),
      catchError(() => throwError(() => error))
    );

    // if (!refreshing) {
    //   return authService.refresh(refreshToken).pipe(
    //     catchError(() => {
    //       authService.logout();
    //       return throwError(() => error);
    //     }),
    //     finalize(() => (refreshing = false)),
    //     switchMap(results => {
    //       return addTokenToRequest(request, next, results.tokens.access);
    //     })
    //   );
    // } else {
    //   return refreshToken$.pipe(
    //     filter(Boolean),
    //     take(1),
    //     switchMap(value => addTokenToRequest(request, next, value.access))
    //   );
    // }
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
