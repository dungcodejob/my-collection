import { AsyncPipe } from "@angular/common";
import { Component, inject } from "@angular/core";
import { ActivatedRoute, Router, RouterOutlet } from "@angular/router";
import { CollectionListComponent } from "@collection/containers/collection-list/collection-list.component";
import { HomeSidebarComponent } from "@home/components/home-sidebar/home-sidebar.component";
import {
  AppFacade,
  CollectionFacade,
  provideCollection,
  provideTag,
} from "@shared/data-access";
import { HlmToasterComponent } from "@spartan-ng/ui-sonner-helm";
import { HlmSpinnerComponent } from "@spartan-ng/ui-spinner-helm";
import { defer, filter, map, merge, Observable, of, switchMap } from "rxjs";
interface ViewModel {
  hasHeader: boolean;
  hasSideBar: boolean;
}

@Component({
  selector: "app-layout",
  standalone: true,
  imports: [
    RouterOutlet,
    AsyncPipe,

    HomeSidebarComponent,
    HlmToasterComponent,
    HlmSpinnerComponent,
    CollectionListComponent,
  ],
  providers: [provideTag(), provideCollection()],
  templateUrl: "./home-shell.component.html",
  styleUrl: "./home-shell.component.scss",
})
export class HomeShellComponent {
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _facade = inject(AppFacade);
  private readonly _collectionFacade = inject(CollectionFacade);

  $loading = this._facade.$loading;

  public vm$: Observable<ViewModel> = merge(
    this._router.events,
    this._activatedRoute.url
  ).pipe(
    switchMap(() =>
      defer(() =>
        this._activatedRoute.firstChild
          ? this._activatedRoute.firstChild?.data.pipe(
              filter(Boolean),
              map(data => ({
                hasHeader: data["hasHeader"] !== false,
                hasSideBar: data["hasSideBar"] !== false,
              }))
            )
          : of({ hasHeader: true, hasSideBar: true })
      )
    )
  );
}
