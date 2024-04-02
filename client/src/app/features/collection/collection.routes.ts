import { Routes } from "@angular/router";
import { CollectionApi } from "./data-access";

export const collectionRoutes: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./containers/collection-list/collection-list.component").then(
        m => m.CollectionComponent
      ),

    providers: [CollectionApi],
  },
];
