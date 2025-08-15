import { Injectable } from "@angular/core";
import { PaginationResponseDto, SingleResponseDto } from "@client/web-core-http";
import { Observable, of } from "rxjs";
import {
  Collection,
  CollectionFilter,
  CreateCollectionRequest,
  UpdateCollectionRequest,
} from "../models";

@Injectable({
  providedIn: "root",
})
export class CollectionService {
  // Placeholder methods for future API integration

  collections: Collection[] = [
    {
      id: "game",
      name: "game",
      path: "/game",
      createdAt: new Date(),
      updatedAt: new Date(),
      children: [],
    },
    {
      id: "action",
      name: "action",
      path: "/game/action",
      parentId: "game",
      createdAt: new Date(),
      updatedAt: new Date(),
      children: [],
    },
    {
      id: "strategy",
      name: "strategy",
      path: "/game/strategy",
      parentId: "game",
      createdAt: new Date(),
      updatedAt: new Date(),
      children: [],
    },
    {
      id: "soul",
      name: "soul",
      path: "/game/soul",
      parentId: "game",

      createdAt: new Date(),
      updatedAt: new Date(),
      children: [],
    },
    {
      id: "simulation",
      name: "simulation",
      path: "/game/simulation",
      parentId: "game",

      createdAt: new Date(),
      updatedAt: new Date(),
      children: [],
    },
    {
      id: "real-time",
      name: "real-time",
      path: "/game/simulation/real-time",
      parentId: "simulation",

      createdAt: new Date(),
      updatedAt: new Date(),
      children: [],
    },
    {
      id: "turn-based",
      name: "turn-based",
      path: "/game/simulation/turn-based",
      parentId: "simulation",

      createdAt: new Date(),
      updatedAt: new Date(),
      children: [],
    },
  ];

  createCollection(
    request: CreateCollectionRequest
  ): Observable<SingleResponseDto<Collection>> {
    const newCollection: Collection = {
      id: this._generateId(),
      name: request.name,
      icon: request.icon,
      path: request.path,
      parentId: request.parentId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.collections.push(newCollection);

    const res: SingleResponseDto<Collection> = {
      statusCode: 200,
      message: "Collection created successfully",
      timestamp: new Date().toISOString(),
      url: "/api/collections",
      method: "POST",
      success: true,
      result: {
        data: newCollection,
      },
    };

    return of(res);
  }

  updateCollection(
    request: UpdateCollectionRequest
  ): Observable<SingleResponseDto<Collection>> {
    const collection = this.collections.find(c => c.id === request.id);
    if (!collection) {
      throw new Error("Collection not found");
    }

    collection.name = request.name || collection.name;
    collection.icon = request.icon || collection.icon;
    collection.updatedAt = new Date();

    const updatedCollection: SingleResponseDto<Collection> = {
      statusCode: 200,
      message: "Collection updated successfully",
      timestamp: new Date().toISOString(),
      url: "/api/collections",
      method: "PUT",
      success: true,
      result: {
        data: collection,
      },
    };

    return of(updatedCollection);
  }

  deleteCollection(request: {
    id: string;
    path: string;
  }): Observable<SingleResponseDto<{ id: string; path: string }>> {
    // TODO: Implement API call
    const deleteCollection: SingleResponseDto<{ id: string; path: string }> = {
      statusCode: 200,
      message: "Collection deleted successfully",
      timestamp: new Date().toISOString(),
      url: "/api/collections",
      method: "DELETE",
      success: true,
      result: {
        data: {
          id: request.id,
          path: request.path,
        },
      },
    };

    return of(deleteCollection);
  }

  getCollectionsByPath(path: string): Observable<PaginationResponseDto<Collection>> {
    const collections = this.collections.filter(collection => collection.path === path);
    const totalCount = collections.length;
    const totalPages = Math.ceil(totalCount / 10);
    const hasPrevious = false;
    const hasNext = totalPages > 1;

    return of<PaginationResponseDto<Collection>>({
      statusCode: 200,
      message: "Collections retrieved successfully",
      timestamp: new Date().toISOString(),
      url: "/api/collections",
      method: "GET",
      success: true,

      result: {
        items: collections,
        meta: {
          pagination: {
            totalCount,
            currentPage: 1,
            pageSize: 10,
            totalPages,
            hasPrevious,
            hasNext,
          },
        },
      },
    });
  }

  getCollectionById(id: string): Observable<SingleResponseDto<Collection>> {
    const collection = this.collections.find(c => c.id === id);

    if (!collection) {
      throw new Error("Collection not found");
    }

    return of<SingleResponseDto<Collection>>({
      statusCode: 200,
      message: "Collection retrieved successfully",
      timestamp: new Date().toISOString(),
      url: "/api/collections",
      method: "GET",
      success: true,
      result: {
        data: collection,
      },
    });
  }

  loadCollections(
    request: CollectionFilter
  ): Observable<PaginationResponseDto<Collection>> {
    let collections = this.collections;

    const parent = this.collections.find(item => item.path === request.path);

    if (parent) {
      collections = collections.filter(item => item.parentId === parent.id);
    } else {
      collections = collections.filter(item => !item.parentId);
    }

    collections = collections.map(item => {
      const children = this.collections.filter(child => child.parentId === item.id);

      return {
        ...item,
        isHasChild: children.length > 0,
      };
    });

    const totalCount = collections.length;
    const totalPages = Math.ceil(totalCount / request.pageSize);
    const hasPrevious = request.currentPage > 1;
    const hasNext = request.currentPage < totalPages;

    return of<PaginationResponseDto<Collection>>({
      statusCode: 200,
      message: "Collections retrieved successfully",
      timestamp: new Date().toISOString(),
      url: "/api/collections",
      method: "GET",
      success: true,
      result: {
        items: collections,
        meta: {
          pagination: {
            totalCount,
            currentPage: request.currentPage,
            pageSize: request.pageSize,
            totalPages,
            hasPrevious,
            hasNext,
          },
        },
      },
    });
  }

  private _generateId(): string {
    return `collection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
