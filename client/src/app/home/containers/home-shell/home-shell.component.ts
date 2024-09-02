import { AsyncPipe } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { ActivatedRoute, Router, RouterOutlet } from "@angular/router";
import { CollectionListComponent } from "@collection/containers/collection-list/collection-list.component";
import { HomeSidebarComponent } from "@home/components/home-sidebar/home-sidebar.component";
import { HlmToasterComponent } from "@spartan-ng/ui-sonner-helm";
import { HlmSpinnerComponent } from "@spartan-ng/ui-spinner-helm";
import { defer, filter, map, merge, Observable, of, switchMap } from "rxjs";
import { HomeShellFacade } from "./home-shell.facade";

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
  providers: [
    HomeShellFacade,
    // provideCollectionApi(),
  ],
  templateUrl: "./home-shell.component.html",
  styleUrl: "./home-shell.component.scss",
})
export class HomeShellComponent implements OnInit {
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _facade = inject(HomeShellFacade);

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

  ngOnInit(): void {
    this._facade.enter();
  }
}
