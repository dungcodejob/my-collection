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
import { AuthStore } from "@nx/web-auth-data-access";

export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authStore = inject(AuthStore);
  const tokens = authStore.$tokens();
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
    const refreshing = authStore.$isRefreshPending();

    if (refreshing) {
      authStore.refresh(refreshToken);
    }

    return toObservable(authStore.$tokens).pipe(
      filter(Boolean),
      filter(() => !refreshing),
      take(1),
      switchMap(value => addTokenToRequest(request, next, value.access)),
      catchError(() => throwError(() => error))
    );
  };

  if (!tokens) {
    return next(request);
  }

  if (exceptions.some(d => request.url.includes(d))) {
    return next(request);
  }

  if (request.headers.has("Authorization")) {
    return next(request);
  }

  return addTokenToRequest(request, next, tokens.access).pipe(
    catchError(error => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === HttpStatusCode.Unauthorized &&
        !exceptions.some(d => request.url.includes(d))
      ) {
        if (!tokens.refresh) {
          return throwError(() => error);
        }

        return handle401Error(request, next, tokens.refresh, error);
      } else {
        return throwError(() => error);
      }
    })
  );
};
