import { Location } from "@angular/common";
import { Injectable, inject } from "@angular/core";
import { Router, UrlTree } from "@angular/router";

@Injectable({ providedIn: "root" })
export class RedirectService {
  private readonly _router = inject(Router);
  private readonly _location = inject(Location);

  private _previousUrl = this._location.path();

  redirectToPreviousUrl() {
    if (!this._previousUrl.includes("security")) {
      this._router.navigateByUrl(this._previousUrl);
    } else {
      this.redirectToHome();
    }
  }

  redirectToHome(): void {
    const urlTree = this.createHomeTree();
    this._router.navigateByUrl(urlTree);
  }
  redirectToLogin(): void {
    const urlTree = this.createLoginTree();
    this._router.navigateByUrl(urlTree);
  }

  redirectToBookmark(collectionId: string): void {
    this._router.navigate(["home", `${collectionId}`]);
  }

  createHomeTree(): UrlTree {
    return this._router.createUrlTree(["home"]);
  }

  createLoginTree(): UrlTree {
    return this._router.createUrlTree(["/security/login"]);
  }
}
