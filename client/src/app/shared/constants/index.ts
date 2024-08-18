export * from "./languages";

import * as authentication from "./message.authentication";
import * as bookmark from "./message.bookmark";
import * as collection from "./message.collection";

export const MessageKeys = { ...authentication, ...bookmark, ...collection };

const Messages: Record<string, string> = {
  [MessageKeys.Bookmark.CreateSuccess]: "Bookmark {0} was created",
  [MessageKeys.Bookmark.CreateFailure]: "Bookmark could not be created",
  [MessageKeys.Bookmark.UpdateSuccess]: "Bookmark {0} was updated",
  [MessageKeys.Bookmark.UpdateFailure]: "Bookmark could not be updated",
  [MessageKeys.Bookmark.NotExist]: "Bookmark {0} to be deleted does not exist",

  [MessageKeys.Collection.CreateSuccess]: "Collection {0} was created",
  [MessageKeys.Collection.CreateFailure]: "Collection could not be created",
  [MessageKeys.Collection.UpdateSuccess]: "Collection {0} was updated",
  [MessageKeys.Collection.UpdateFailure]: "Collection {0} could not be saved",
  [MessageKeys.Collection.NotExist]: "Collection {0} to be updated does not exist",
};

export const getMessage = (key: string) => {
  return Messages[key];
};
