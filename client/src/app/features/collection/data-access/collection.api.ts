import { Injectable, inject } from "@angular/core";
import { HttpService, ListResponseDto, SingleResponseDto } from "@core/http";
import { CollectionDto, CreateCollectionDto, UpdateCollectionDto } from "@shared/models";
import { Observable } from "rxjs";

@Injectable()
export class CollectionApi {
  private readonly _http = inject(HttpService);

  findAll(): Observable<ListResponseDto<CollectionDto>> {
    return this._http.get("/collection");
  }

  create(body: CreateCollectionDto): Observable<SingleResponseDto<CollectionDto>> {
    return this._http.put("/collection", body);
  }

  update(
    id: string,
    body: UpdateCollectionDto
  ): Observable<SingleResponseDto<CollectionDto>> {
    return this._http.post(`/collection/${id}/`, body);
  }

  delete(id: string): Observable<SingleResponseDto<CollectionDto>> {
    return this._http.delete(`/collection/${id}/`);
  }
}
