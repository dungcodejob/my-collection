import { HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import {
  HttpService,
  PaginationResponseDto,
  PaginationResult,
  SingleResponseDto,
  SingleResult,
} from "@core/http";
import {
  BookmarkDto,
  BookmarkQueryDto,
  CreateBookmarkDto,
  MoveCollectionDto,
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
    return this._http.get<PaginationResult<BookmarkDto>>("/bookmark", { params });
  }

  move(id: string, body: MoveCollectionDto): Observable<SingleResponseDto<BookmarkDto>> {
    return this._http.post<SingleResult<BookmarkDto>>(`/collection/${id}/move`, body);
  }

  create(body: CreateBookmarkDto): Observable<SingleResponseDto<BookmarkDto>> {
    return this._http.post<SingleResult<BookmarkDto>>("/collection", body);
  }

  update(
    id: string,
    body: UpdateBookmarkDto
  ): Observable<SingleResponseDto<BookmarkDto>> {
    return this._http.put<SingleResult<BookmarkDto>>(`/collection/${id}/`, body);
  }

  delete(id: string): Observable<SingleResponseDto<void>> {
    return this._http.delete(`/collection/${id}/`);
  }
}
