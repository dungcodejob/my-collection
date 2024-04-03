import { Injectable, inject } from "@angular/core";
import { HttpService, ListResponseDto, SingleResponseDto } from "@core/http";
import { CollectionDto, CreateCollectionDto } from "@shared/models";
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
}
