import { Routes } from "@angular/router";
import { BookmarkStore } from "@client/web-bookmark-data-access";
import { MCBookmarkList } from "@client/web-bookmark-feature-list";

/**
 * T023: Bookmark shell routes
 * Includes route for collection browser
 */
export const BookmarkShellRoutes: Routes = [
  {
    path: "",
    component: MCBookmarkList,
    providers: [BookmarkStore],
  },
];
