import { Injectable } from "@angular/core";
import { Tag } from "../models";

type TagTree = { [collectionId: string]: Tag[] };

@Injectable({ providedIn: "root" })
export class TagAdapter {
  addTag(tree: TagTree, collectionId: string, tag: Tag): TagTree {
    const tagsInCollection = tree[collectionId] || [];
    return {
      ...tree,
      [collectionId]: [...tagsInCollection, tag],
    };
  }

  updateTag(tree: TagTree, collectionId: string, tag: Tag): TagTree {
    const tagsInCollection = [...(tree[collectionId] || [])];
    const indexToUpdate = tagsInCollection.findIndex(item => item.id === tag.id);

    if (indexToUpdate === -1) {
      return tree;
    }

    tagsInCollection[indexToUpdate] = {
      ...tagsInCollection[indexToUpdate],
      ...tag,
    };

    return {
      ...tree,
      [collectionId]: tagsInCollection,
    };
  }

  deleteTag(tree: TagTree, collectionId: string, tagId: string): TagTree {
    const tagsInCollection = [...(tree[collectionId] || [])];
    const indexToRemove = tagsInCollection.findIndex(item => item.id === tagId);

    if (indexToRemove === -1) {
      return tree;
    }

    tagsInCollection.splice(indexToRemove, 1);

    return {
      ...tree,
      [collectionId]: tagsInCollection,
    };
  }

  setTags(tree: TagTree, collectionId: string, tags: Tag[]): TagTree {
    return {
      ...tree,
      [collectionId]: tags,
    };
  }
}
