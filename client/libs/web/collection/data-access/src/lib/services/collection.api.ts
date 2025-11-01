import { inject, Injectable } from "@angular/core";
import { HttpService, ListResponseDto, SingleResponseDto } from "@client/web-core-http";
import { API_ENDPOINTS } from "@client/web-shared-constants";
import { Observable } from "rxjs";
import {
  Collection,
  CollectionFilter,
  CreateCollectionRequest,
  UpdateCollectionRequest,
} from "../models";

@Injectable({
  providedIn: "root",
})
export class CollectionApi {
  private readonly _httpService = inject(HttpService);
  // Placeholder methods for future API integration

  loadCollections(request: CollectionFilter): Observable<ListResponseDto<Collection>> {
    return this._httpService.get<ListResponseDto<Collection>>(
      API_ENDPOINTS.COLLECTIONS.BASE,
      { params: request }
    );
  }

  findCollectionById(id: string): Observable<SingleResponseDto<Collection>> {
    return this._httpService.get<SingleResponseDto<Collection>>(
      API_ENDPOINTS.COLLECTIONS.BY_ID(id)
    );
  }

  createCollection(
    request: CreateCollectionRequest
  ): Observable<SingleResponseDto<Collection>> {
    return this._httpService.post<SingleResponseDto<Collection>>(
      API_ENDPOINTS.COLLECTIONS.BASE,
      request
    );
  }

  updateCollection(
    request: UpdateCollectionRequest
  ): Observable<SingleResponseDto<Collection>> {
    return this._httpService.put<SingleResponseDto<Collection>>(
      API_ENDPOINTS.COLLECTIONS.BY_ID(request.id),
      request
    );
  }

  deleteCollection(request: {
    id: string;
    path: string;
  }): Observable<SingleResponseDto<{ id: string; path: string }>> {
    return this._httpService.delete<SingleResponseDto<{ id: string; path: string }>>(
      API_ENDPOINTS.COLLECTIONS.BY_ID(request.id)
    );
  }
}
