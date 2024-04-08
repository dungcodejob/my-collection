import { Injectable, inject } from "@angular/core";
import {
  HttpService,
  ListResponseDto,
  ListResult,
  SingleResponseDto,
  SingleResult,
} from "@core/http";
import { CollectionAdapter, ResponseAdapter } from "@shared/adapters";
import {
  CollectionDto,
  CollectionVM,
  CreateCollectionDto,
  MoveCollectionDto,
  UpdateCollectionDto,
} from "@shared/models";
import { Observable, map } from "rxjs";
import { CollectionApi } from "./collection.api";

@Injectable()
export class CollectionImplApi implements CollectionApi {
  private readonly _http = inject(HttpService);
  private readonly _responseAdapter = new ResponseAdapter();
  private readonly _collectionAdapter = new CollectionAdapter();

  findAll(): Observable<ListResponseDto<CollectionVM>> {
    return this._http
      .get<ListResult<CollectionDto>>("/collection")
      .pipe(map(res => this._responseAdapter.fromListDto(res, this._collectionAdapter)));
  }

  move(id: string, body: MoveCollectionDto): Observable<SingleResponseDto<CollectionVM>> {
    return this._http
      .post<SingleResult<CollectionDto>>(`/collection/${id}/move`, body)
      .pipe(
        map(res => this._responseAdapter.fromSingleDto(res, this._collectionAdapter))
      );
  }

  create(body: CreateCollectionDto): Observable<SingleResponseDto<CollectionVM>> {
    return this._http
      .post<SingleResult<CollectionDto>>("/collection", body)
      .pipe(
        map(res => this._responseAdapter.fromSingleDto(res, this._collectionAdapter))
      );
  }

  update(
    id: string,
    body: UpdateCollectionDto
  ): Observable<SingleResponseDto<CollectionVM>> {
    return this._http
      .put<SingleResult<CollectionDto>>(`/collection/${id}/`, body)
      .pipe(
        map(res => this._responseAdapter.fromSingleDto(res, this._collectionAdapter))
      );
  }

  delete(id: string): Observable<SingleResponseDto<void>> {
    return this._http.delete(`/collection/${id}/`);
  }
}
