import { Injectable, inject } from "@angular/core";
import { Router, UrlTree } from "@angular/router";
import { ROUTES } from "@client/web-shared-constants";

export const REDIRECT_PARAM = "redirectTo";

@Injectable({
  providedIn: "root",
})
export class RedirectService {
  private readonly _router = inject(Router);

  /**
   * Get redirect URL from query param
   */
  getSavedUrl(): string | null {
    return this.getRedirectUrlFromQueryParam();
  }

  /**
   * Get redirect URL from query parameter
   */
  private getRedirectUrlFromQueryParam(): string | null {
    const urlTree = this._router.parseUrl(this._router.url);
    const redirectTo = urlTree.queryParams[REDIRECT_PARAM];

    if (redirectTo && typeof redirectTo === "string") {
      // Decode URL if needed
      try {
        return decodeURIComponent(redirectTo);
      } catch {
        return redirectTo;
      }
    }

    return null;
  }

  /**
   * Clear redirect URL from query parameter
   */
  clearSavedUrl(): void {
    // Remove query param if currently on page with redirectTo
    const urlTree = this._router.parseUrl(this._router.url);
    if (urlTree.queryParams[REDIRECT_PARAM]) {
      delete urlTree.queryParams[REDIRECT_PARAM];
      this._router.navigateByUrl(urlTree, { replaceUrl: true });
    }
  }

  /**
   * Create UrlTree for login page with redirect URL in query param
   */
  createLoginUrlTree(redirectUrl?: string): UrlTree {
    const urlToRedirect = redirectUrl || this._router.url;

    // Don't add redirectTo if already on login page or invalid URL
    if (this.isAllowAddRedirectParam(urlToRedirect)) {
      return this._router.createUrlTree([ROUTES.LOGIN]);
    }

    return this._router.createUrlTree([ROUTES.LOGIN], {
      queryParams: {
        [REDIRECT_PARAM]: encodeURIComponent(urlToRedirect),
      },
    });
  }

  /**
   * Redirect to saved URL or default page
   */
  redirectToSavedUrl(defaultUrl = "/"): void {
    const savedUrl = this.getSavedUrl() ?? defaultUrl;
    if (this.isAllowAddRedirectParam(savedUrl)) {
      this.clearSavedUrl();
      this._router.navigateByUrl(savedUrl);
    } else {
      this._router.navigateByUrl(defaultUrl);
    }
  }

  /**
   * Redirect to specific URL
   */
  redirectToUrl(url: string): void {
    this._router.navigateByUrl(url);
  }

  /**
   * Check if there is a saved redirect URL
   */
  hasSavedRedirectUrl(): boolean {
    return !!this.getSavedUrl();
  }

  /**
   * Get current URL without redirectTo query param
   */
  getCurrentUrlWithoutRedirectParam(): string {
    const urlTree = this._router.parseUrl(this._router.url);
    delete urlTree.queryParams[REDIRECT_PARAM];
    return this._router.serializeUrl(urlTree);
  }

  /**
   * Create login URL with redirect parameter
   */
  createLoginUrlWithRedirect(redirectUrl: string): string {
    const loginUrlTree = this.createLoginUrlTree(redirectUrl);
    return this._router.serializeUrl(loginUrlTree);
  }

  private isAllowAddRedirectParam(url: string | null): boolean {
    return !!url && url !== ROUTES.LOGIN && !url.includes(ROUTES.LOGIN);
  }
}
