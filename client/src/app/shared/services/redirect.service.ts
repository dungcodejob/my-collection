import { Injectable, inject } from "@angular/core";
import { Router, UrlTree } from "@angular/router";

@Injectable({ providedIn: "root" })
export class RedirectService {
  private readonly _router = inject(Router);

  constructor() {}

  redirectToHome(): void {
    const urlTree = this.createHomeTree();
    this._router.navigateByUrl(urlTree);
  }

  createHomeTree(): UrlTree {
    return this._router.createUrlTree(["home", { outlets: { sidebar: ["collection"] } }]);
  }

  createLoginTree(): UrlTree {
    return this._router.createUrlTree(["/security/login"]);
  }

  redirectToLogin(): void {
    const urlTree = this.createLoginTree();
    this._router.navigateByUrl(urlTree);
  }
}
