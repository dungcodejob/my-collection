import { inject, Injectable } from "@angular/core";
import { BaseAdapter } from "@client/web-shared-data-access";
import { Collection } from "../models";

type CollectionTree = { [path: string]: Collection[] };

@Injectable({ providedIn: "root" })
export class CollectionAdapter {
  private readonly _baseAdapter = inject(BaseAdapter);

  addCollection(
    tree: CollectionTree,
    path: string,
    collection: Collection
  ): CollectionTree {
    const collections = tree;
    const collectionsInPath = tree[path];

    return {
      ...collections,
      [path]: collectionsInPath ? [...collectionsInPath, collection] : [collection],
    };
  }

  updateCollection(
    tree: CollectionTree,
    path: string,
    collection: Collection
  ): CollectionTree {
    const collections = tree;
    const collectionsInPath = [...tree[collection.path]];

    if (!collectionsInPath) {
      throw new Error("not exist collections with path: " + collection.path);
    }

    const indexToUpdate = collectionsInPath.findIndex(item => item.id === collection.id);

    if (!indexToUpdate) {
      throw new Error("not exist collection with id: " + collection.id);
    }

    collectionsInPath[indexToUpdate] = collection;

    return {
      ...collections,
      [path]: collectionsInPath,
    };
  }

  removeCollection(
    tree: CollectionTree,
    path: string,
    collectionId: string
  ): CollectionTree {
    const collections = tree;
    const collectionsInPath = [...tree[path]];

    if (!collectionsInPath) {
      throw new Error("not exist collections with path: " + path);
    }

    const indexToRemove = collectionsInPath.findIndex(item => item.id === collectionId);

    if (!indexToRemove) {
      throw new Error("not exist collection with id: " + collectionId);
    }

    collectionsInPath.splice(indexToRemove, 1);

    return {
      ...collections,
      [path]: collectionsInPath,
    };
  }

  setCollections(
    tree: CollectionTree,
    path: string,
    collections: Collection[]
  ): CollectionTree {
    return {
      ...tree,
      [path]: collections,
    };
  }

  getCollectionById(
    tree: CollectionTree,
    collectionId?: string | null
  ): Collection | null {
    const collections = Object.values(tree).flat();

    if (!collections) {
      throw new Error("not exist collections");
    }

    const collection = collections.find(item => item.id === collectionId);

    if (!collection) {
      return null;
    }

    return collection;
  }

  // toItemVM(value: CollectionDto): CollectionVM;
  // toItemVM(value: CollectionDto[]): CollectionVM[];
  // toItemVM(value: CollectionDto | CollectionDto[]): CollectionVM | CollectionVM[] {
  //   if (Array.isArray(value)) {
  //     return value.map(item => this.toItemVM(item));
  //   }
  //   const base = this._baseAdapter.toVM(value);
  //   return new CollectionVM({
  //     ...base,
  //     icon: value.icon,
  //     title: value.title,
  //     position: value.position,
  //   });
  // }

  // toItemDto(value: CollectionVM): CollectionDto;
  // toItemDto(value: CollectionVM[]): CollectionDto[];
  // toItemDto(value: CollectionVM | CollectionVM[]): CollectionDto | CollectionDto[] {
  //   if (Array.isArray(value)) {
  //     return value.map(item => this.toItemDto(item));
  //   }
  //   const base = this._baseAdapter.toDto(value);
  //   return new CollectionDto({
  //     ...base,
  //     icon: value.icon,
  //     title: value.title,
  //     position: value.position,
  //   });
  // }
}
