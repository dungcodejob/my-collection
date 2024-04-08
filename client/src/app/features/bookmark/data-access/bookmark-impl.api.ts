import { HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import {
  HttpService,
  PaginationResponseDto,
  PaginationResult,
  SingleResponseDto,
  SingleResult,
} from "@core/http";
import { BookmarkAdapter, ResponseAdapter } from "@shared/adapters";
import {
  BookmarkDto,
  BookmarkQueryDto,
  BookmarkVM,
  CreateBookmarkDto,
  MoveCollectionDto,
  UpdateBookmarkDto,
} from "@shared/models";
import { Observable, map } from "rxjs";
import { BookmarkApi } from "./bookmark.api";

@Injectable()
export class BookmarkImplApi implements BookmarkApi {
  private readonly _http = inject(HttpService);
  private readonly _responseAdapter = new ResponseAdapter();
  private readonly _bookmarkAdapter = new BookmarkAdapter();

  findAll(query: BookmarkQueryDto): Observable<PaginationResponseDto<BookmarkVM>> {
    let params = new HttpParams();
    if (query.collectionId) {
      params = params.set("collectionId", query.collectionId);
    }
    params = params.set("currentPage", query.currentPage);
    params = params.set("pageSize", query.pageSize);
    return this._http
      .get<PaginationResult<BookmarkDto>>("/bookmark", { params })
      .pipe(
        map(res => this._responseAdapter.fromPaginationDto(res, this._bookmarkAdapter))
      );
  }

  move(id: string, body: MoveCollectionDto): Observable<SingleResponseDto<BookmarkVM>> {
    return this._http
      .post<SingleResult<BookmarkDto>>(`/collection/${id}/move`, body)
      .pipe(map(res => this._responseAdapter.fromSingleDto(res, this._bookmarkAdapter)));
  }

  create(body: CreateBookmarkDto): Observable<SingleResponseDto<BookmarkVM>> {
    return this._http
      .post<SingleResult<BookmarkDto>>("/collection", body)
      .pipe(map(res => this._responseAdapter.fromSingleDto(res, this._bookmarkAdapter)));
  }

  update(id: string, body: UpdateBookmarkDto): Observable<SingleResponseDto<BookmarkVM>> {
    return this._http
      .put<SingleResult<BookmarkDto>>(`/collection/${id}/`, body)
      .pipe(map(res => this._responseAdapter.fromSingleDto(res, this._bookmarkAdapter)));
  }

  delete(id: string): Observable<SingleResponseDto<void>> {
    return this._http.delete(`/collection/${id}/`);
  }
}
