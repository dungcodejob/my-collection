import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
  ActivatedRoute,
  NavigationEnd,
  Params,
  Router,
  RouterModule,
  RouterOutlet,
} from "@angular/router";
import { AppStore } from "@client/web-shared-data-access";
import { MCThemeService } from "@client/web-shared-services";
import { NgxSonnerToaster } from "ngx-sonner";
import { filter, tap } from "rxjs";
@Component({
  imports: [RouterModule, RouterOutlet, NgxSonnerToaster],
  selector: "app-root",
  templateUrl: "./app.html",
  styleUrl: "./app.css",
})
export class App implements OnInit {
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _appStore = inject(AppStore);
  private readonly _themeService = inject(MCThemeService);

  constructor() {
    this._themeService.initialize();
  }

  ngOnInit(): void {
    this._paramChangeEffect();
  }

  private _paramChangeEffect(): void {
    this._router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        tap(() => {
          const params = this._getRouteParams(this._route);
          this._appStore.setParams(params);
        }),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe();
  }

  private _getRouteParams(route: ActivatedRoute): Params {
    let params: Record<string, unknown> = {};
    let current: ActivatedRoute | null = route;

    while (current) {
      params = { ...params, ...current.snapshot.params };
      current = current.firstChild;
    }

    return params;
  }
}
