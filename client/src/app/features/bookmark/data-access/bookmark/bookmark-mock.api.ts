import { Injectable } from "@angular/core";
import { PaginationMetaDto, PaginationResponseDto, SingleResponseDto } from "@core/http";
import { BookmarkAdapter, ResponseAdapter } from "@shared/adapters";
import { BaseMockApi } from "@shared/data-access";
import { LocalStorageKeys } from "@shared/enums";
import {
  BookmarkDto,
  BookmarkQueryDto,
  BookmarkVM,
  CreateBookmarkDto,
  UpdateBookmarkDto,
} from "@shared/models";
import { Observable, map, of } from "rxjs";
import { BookmarkApi } from "./bookmark.api";

@Injectable()
export class BookmarkMockApi extends BaseMockApi implements BookmarkApi {
  private _entities: BookmarkDto[] = [];
  private readonly _responseAdapter = new ResponseAdapter();
  private readonly _bookmarkAdapter = new BookmarkAdapter();

  constructor() {
    super();

    this._entities = this._loadFromLocal<BookmarkDto[]>(LocalStorageKeys.Bookmark) ?? [];
  }

  findAll(query: BookmarkQueryDto): Observable<PaginationResponseDto<BookmarkVM>> {
    const pagination: PaginationMetaDto = {
      currentPage: query.currentPage,
      pageSize: query.pageSize,
      hasNext: true,
      hasPrevious: true,
      totalCount: this._entities.length,
      totalPages: this._entities.length / query.pageSize,
    };
    let result = this._entities;
    if (query.collectionId) {
      result = result.filter(item => item.collectionId === query.collectionId);
    }

    const offset = query.pageSize * (query.currentPage - 1);
    const limit = query.pageSize;
    result = result.splice(offset, offset + limit);
    const res = this._createPaginationResponse(result, pagination);
    return of(res).pipe(
      map(res => this._responseAdapter.fromPaginationDto(res, this._bookmarkAdapter))
    );
  }

  create(body: CreateBookmarkDto): Observable<SingleResponseDto<BookmarkVM>> {
    const base = this._createBaseDto();
    const entity: BookmarkDto = {
      ...body,
      ...base,
    };

    this._entities.push(entity);
    this._syncBookmark();

    const res = this._createSingleResponse(entity);

    return of(res).pipe(
      map(res => this._responseAdapter.fromSingleDto(res, this._bookmarkAdapter))
    );
  }

  update(id: string, body: UpdateBookmarkDto): Observable<SingleResponseDto<BookmarkVM>> {
    const indexToUpdate = this._entities.findIndex(item => item.id === id);
    if (indexToUpdate === -1) {
      throw Error("entity not found");
    }
    const entityToUpdate = { ...this._entities[indexToUpdate], ...body };
    entityToUpdate.updateAt = new Date().toISOString();
    this._entities[indexToUpdate] = entityToUpdate;
    this._syncBookmark();

    const res = this._createSingleResponse(entityToUpdate);
    return of(res).pipe(
      map(res => this._responseAdapter.fromSingleDto(res, this._bookmarkAdapter))
    );
  }

  delete(id: string): Observable<SingleResponseDto<void>> {
    this._entities = this._entities.filter(entity => entity.id === id);
    this._syncBookmark();
    const res = this._createSingleResponse<void>(undefined);
    return of(res);
  }

  private _syncBookmark() {
    this._saveToLocal(this._entities, LocalStorageKeys.Bookmark);
  }
}
