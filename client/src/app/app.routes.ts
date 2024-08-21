import { Routes } from "@angular/router";
import {
  CollectionFacade,
  CollectionStore,
  provideCollectionMockApi,
} from "@collection/data-access";
import { authGuard, noAuthGuard } from "@core/auth";
import { NotAuthorizedComponent } from "./home";

export const routes: Routes = [
  {
    path: "",
    redirectTo: "home",
    pathMatch: "full",
  },
  {
    path: "home",
    canActivate: [authGuard],
    loadComponent: () => import("./home").then(m => m.HomeShellComponent),
    providers: [provideCollectionMockApi(), CollectionStore, CollectionFacade],
    children: [
      {
        path: ":collectionId",
        loadChildren: () => import("./bookmark").then(m => m.bookmarkRoutes),
      },
    ],
  },

  {
    path: "security",
    canActivate: [noAuthGuard],
    loadChildren: () => import("./security").then(m => m.securityRoutes),
  },
  {
    path: "not-authorized",
    component: NotAuthorizedComponent,
    data: { preload: true },
  },
];
