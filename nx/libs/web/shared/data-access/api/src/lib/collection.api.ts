import { Injectable, inject } from "@angular/core"; 
import {HttpService, ListResponseDto, SingleResponseDto} from '@nx/web-shared-http'
import { Observable } from "rxjs";
import {CollectionDto, CreateCollectionDto, MoveCollectionDto, UpdateCollectionDto} from '@nx/web-shared-models'
@Injectable()
export class CollectionApi  {
  private readonly _http = inject(HttpService);

  findAll(): Observable<ListResponseDto<CollectionDto>> {
    return this._http.get<ListResponseDto<CollectionDto>>("/collection");
  }

  move(
    id: string,
    body: MoveCollectionDto
  ): Observable<SingleResponseDto<CollectionDto>> {
    return this._http.post<SingleResponseDto<CollectionDto>>(
      `/collection/${id}/move`,
      body
    );
  }

  create(body: CreateCollectionDto): Observable<SingleResponseDto<CollectionDto>> {
    return this._http.post<SingleResponseDto<CollectionDto>>("/collection", body);
  }

  update(
    id: string,
    body: UpdateCollectionDto
  ): Observable<SingleResponseDto<CollectionDto>> {
    return this._http.put<SingleResponseDto<CollectionDto>>(`/collection/${id}/`, body);
  }

  delete(id: string): Observable<SingleResponseDto<void>> {
    return this._http.delete(`/collection/${id}/`);
  }
}
