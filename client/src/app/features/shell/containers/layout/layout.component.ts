import { AsyncPipe } from "@angular/common";
import { Component, inject } from "@angular/core";
import { ActivatedRoute, Router, RouterOutlet } from "@angular/router";
import { HeaderComponent } from "@shell/components/header/header.component";
import { SidebarComponent } from "@shell/components/sidebar/sidebar.component";
import { Observable, defer, filter, map, merge, of, switchMap } from "rxjs";
type ViewModel = {
  hasHeader: boolean;
  hasSideBar: boolean;
};

@Component({
  selector: "app-layout",
  standalone: true,
  imports: [RouterOutlet, AsyncPipe, HeaderComponent, SidebarComponent],
  templateUrl: "./layout.component.html",
  styleUrl: "./layout.component.scss",
})
export class LayoutComponent {
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _router = inject(Router);

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
