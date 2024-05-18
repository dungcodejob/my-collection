import { HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import {
  HttpService,
  PaginationResponseDto,
  PaginationResult,
  SingleResponseDto,
  SingleResult,
} from "@core/http";
import { ResponseAdapter, TagAdapter } from "@shared/adapters";
import { CreateTagDto, TagDto, TagQueryDto, TagVM } from "@shared/models";
import { Observable, map } from "rxjs";
import { TagApi } from "./tag.api";

@Injectable()
export class TagImplApi implements TagApi {
  private readonly _http = inject(HttpService);
  private readonly _responseAdapter = new ResponseAdapter();
  private readonly _tagAdapter = new TagAdapter();
  constructor() {}
  findAll(query: TagQueryDto): Observable<PaginationResponseDto<TagVM>> {
    let params = new HttpParams();
    if (query.collectionId) {
      params = params.set("collectionId", query.collectionId);
    }
    if (query.keyword) {
      params = params.set("keyword", query.keyword);
    }
    params = params.set("currentPage", query.currentPage);
    params = params.set("pageSize", query.pageSize);

    return this._http
      .get<PaginationResult<TagDto>>("/tag", { params })
      .pipe(map(res => this._responseAdapter.fromPaginationDto(res, this._tagAdapter)));
  }

  create(body: CreateTagDto): Observable<SingleResponseDto<TagVM>> {
    return this._http
      .post<SingleResult<TagDto>>("/tag", body)
      .pipe(map(res => this._responseAdapter.fromSingleDto(res, this._tagAdapter)));
  }
}
