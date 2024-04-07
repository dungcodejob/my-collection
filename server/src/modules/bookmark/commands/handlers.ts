import { CreateBookmarkHandler } from "./create-bookmark/create-bookmark.handler";
import { DeleteBookmarkHandler } from "./delete-bookmark/delete-bookmark.handler";
import { UpdateBookmarkHandler } from "./update-bookmark/update-bookmark.handler";

export const CommandHandlers = [
  CreateBookmarkHandler,
  DeleteBookmarkHandler,
  UpdateBookmarkHandler,
];
