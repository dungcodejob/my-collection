import { Injectable, inject } from "@angular/core";
import { HttpService, ListResponseDto } from "@core/http";
import { CollectionDto } from "@shared/models";
import { Observable } from "rxjs";

@Injectable()
export class CollectionApi {
  private readonly _http = inject(HttpService);

  findAll(): Observable<ListResponseDto<CollectionDto>> {
    return this._http.get("/collection");
  }
}
