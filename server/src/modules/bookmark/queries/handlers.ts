import { GetAllBookHandler } from "./get-all-bookmark/get-all-bookmark.handler";
import { GetBookmarkInCollectionBookHandler } from "./get-bookmark-in-collection/get-bookmark-in-collection.handler";

export const QueriesHandlers = [GetAllBookHandler, GetBookmarkInCollectionBookHandler];
