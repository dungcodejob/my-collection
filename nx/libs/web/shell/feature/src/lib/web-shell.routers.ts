import { Routes } from '@angular/router';
import { LayoutComponent } from '@nx/web-shell-ui-layout';
export const webShellRoutes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    // canActivate: [authGuard],
    component: LayoutComponent,
    providers: [],
    // children: [
    //   {
    //     path: ':collectionId',
    //     loadChildren: () => import('./bookmark').then((m) => m.bookmarkRoutes),
    //   },
    // ],
  },
];
