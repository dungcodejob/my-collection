import { Injectable, inject } from "@angular/core";
import {
  HttpService,
  ListResponseDto,
  ListResult,
  SingleResponseDto,
  SingleResult,
} from "@core/http";
import { CollectionDto, CreateCollectionDto, UpdateCollectionDto } from "@shared/models";
import { Observable } from "rxjs";
import { CollectionApi } from "./collection.api";

@Injectable()
export class CollectionImplApi implements CollectionApi {
  private readonly _http = inject(HttpService);

  findAll(): Observable<ListResponseDto<CollectionDto>> {
    return this._http.get<ListResult<CollectionDto>>("/collection");
  }

  create(body: CreateCollectionDto): Observable<SingleResponseDto<CollectionDto>> {
    return this._http.put<SingleResult<CollectionDto>>("/collection", body);
  }

  update(
    id: string,
    body: UpdateCollectionDto
  ): Observable<SingleResponseDto<CollectionDto>> {
    return this._http.post<SingleResult<CollectionDto>>(`/collection/${id}/`, body);
  }

  delete(id: string): Observable<SingleResponseDto<void>> {
    return this._http.delete(`/collection/${id}/`);
  }
}
