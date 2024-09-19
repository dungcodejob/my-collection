import { HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { HttpService, PaginationResponseDto, SingleResponseDto } from "@core/http";
import {
  BookmarkDto,
  BookmarkQueryDto,
  CreateBookmarkDto,
  UpdateBookmarkDto,
} from "@shared/models";
import { Observable } from "rxjs";
import { BookmarkApi } from "./bookmark.api";

@Injectable()
export class BookmarkImplApi implements BookmarkApi {
  private readonly _http = inject(HttpService);

  findAll(query: BookmarkQueryDto): Observable<PaginationResponseDto<BookmarkDto>> {
    let params = new HttpParams();
    if (query.collectionId) {
      params = params.set("collectionId", query.collectionId);
    }
    params = params.set("currentPage", query.currentPage);
    params = params.set("pageSize", query.pageSize);
    return this._http.get<PaginationResponseDto<BookmarkDto>>("/bookmark", { params });
  }

  create(body: CreateBookmarkDto): Observable<SingleResponseDto<BookmarkDto>> {
    return this._http.post<SingleResponseDto<BookmarkDto>>("/bookmark", body);
  }

  update(
    id: string,
    body: UpdateBookmarkDto
  ): Observable<SingleResponseDto<BookmarkDto>> {
    return this._http.put<SingleResponseDto<BookmarkDto>>(`/bookmark/${id}/`, body);
  }

  delete(id: string): Observable<SingleResponseDto<void>> {
    return this._http.delete(`/bookmark/${id}/`);
  }
}
