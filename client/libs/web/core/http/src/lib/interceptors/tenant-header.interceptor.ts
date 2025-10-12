import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { TenantService } from "@client/web-shared-services";

/**
 * Interceptor to automatically add tenant ID header to all HTTP requests
 */
export const tenantHeaderInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const tenantService = inject(TenantService);

  // Get tenant ID from the tenant service
  const tenantId = tenantService.getTenantIdForHeaders();

  // If tenant ID is available, add it to the request headers
  if (tenantId) {
    const headers = request.headers.set("x-tenant-id", tenantId);
    const requestClone = request.clone({ headers });
    return next(requestClone);
  }

  return next(request);
};
