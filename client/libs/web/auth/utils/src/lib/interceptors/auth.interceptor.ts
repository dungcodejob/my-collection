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
import { authEvents, AuthStore } from "@client/web-auth-data-access";
import { API_ENDPOINTS } from "@client/web-shared-constants";
import { injectDispatch } from "@ngrx/signals/events";
import { catchError, filter, Observable, switchMap, take, throwError } from "rxjs";

export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authStore = inject(AuthStore);
  const dispatch = injectDispatch(authEvents);
  const tokens = authStore.tokens();

  const exceptions = [
    API_ENDPOINTS.AUTH.LOGIN,
    API_ENDPOINTS.AUTH.REFRESH,
    API_ENDPOINTS.ASSETS.BASE,
  ];

  const handle401Error = (
    nextRequest: HttpRequest<unknown>,
    handler: HttpHandlerFn,
    refreshToken: string,
    error: HttpErrorResponse
  ): Observable<HttpEvent<unknown>> => {
    const refreshing = authStore.$isRefreshPending();

    if (refreshing) {
      dispatch.refreshToken({ refreshToken });
    }

    return toObservable(authStore.tokens).pipe(
      filter(Boolean),
      filter(() => !refreshing),
      take(1),
      switchMap(value => addTokenToRequest(nextRequest, handler, value.accessToken)),
      catchError(() => throwError(() => error))
    );
  };

  const addTokenToRequest = (
    nextRequest: HttpRequest<unknown>,
    handler: HttpHandlerFn,
    accessToken: string
  ): Observable<HttpEvent<unknown>> => {
    const headers = nextRequest.headers.set("Authorization", `Bearer ${accessToken}`);
    const requestClone = nextRequest.clone({ headers });

    return handler(requestClone);
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

  return addTokenToRequest(request, next, tokens.accessToken).pipe(
    catchError(error => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === HttpStatusCode.Unauthorized &&
        !exceptions.some(d => request.url.includes(d))
      ) {
        if (!tokens.refreshToken) {
          return throwError(() => error);
        }

        return handle401Error(request, next, tokens.refreshToken, error);
      } else {
        return throwError(() => error);
      }
    })
  );
};
