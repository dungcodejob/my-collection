import { HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { HttpService, PaginationResponseDto, SingleResponseDto } from "@core/http";
import { CreateTagDto, TagDto, TagQueryDto } from "@shared/models";
import { Observable } from "rxjs";
import { TagApi } from "./tag.api";

@Injectable()
export class TagImplApi implements TagApi {
  private readonly _http = inject(HttpService);

  findAll(query: TagQueryDto): Observable<PaginationResponseDto<TagDto>> {
    let params = new HttpParams();
    if (query.collectionId) {
      params = params.set("collectionId", query.collectionId);
    }
    if (query.keyword) {
      params = params.set("keyword", query.keyword);
    }
    params = params.set("currentPage", query.currentPage);
    params = params.set("pageSize", query.pageSize);

    return this._http.get<PaginationResponseDto<TagDto>>("/tag", { params });
  }

  create(body: CreateTagDto): Observable<SingleResponseDto<TagDto>> {
    return this._http.post<SingleResponseDto<TagDto>>("/tag", body);
  }
}
