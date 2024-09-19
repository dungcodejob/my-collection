import { Injectable } from "@angular/core";
import { PaginationMetaDto, PaginationResponseDto, SingleResponseDto } from "@core/http";
import { BaseMockApi } from "@shared/data-access";
import { LocalStorageKeys } from "@shared/enums";
import {
  BookmarkDto,
  BookmarkQueryDto,
  CollectionDto,
  CreateBookmarkDto,
  TagDto,
  UpdateBookmarkDto,
} from "@shared/models";
import { Observable, of } from "rxjs";
import { BookmarkApi } from "./bookmark.api";

@Injectable()
export class BookmarkMockApi extends BaseMockApi implements BookmarkApi {
  private _bookmarkEntities: BookmarkDto[] = [];
  private _tagEntities: TagDto[] = [];
  private _collectionEntities: CollectionDto[] = [];

  constructor() {
    super();

    this._bookmarkEntities =
      this._loadFromLocal<BookmarkDto[]>(LocalStorageKeys.Bookmark) ?? [];

    this._tagEntities = this._loadFromLocal<TagDto[]>(LocalStorageKeys.Tag) ?? [];
    this._collectionEntities =
      this._loadFromLocal<CollectionDto[]>(LocalStorageKeys.Collection) ?? [];
  }

  findAll(query: BookmarkQueryDto): Observable<PaginationResponseDto<BookmarkDto>> {
    const pagination: PaginationMetaDto = {
      currentPage: query.currentPage,
      pageSize: query.pageSize,
      hasNext: true,
      hasPrevious: true,
      totalCount: this._bookmarkEntities.length,
      totalPages: this._bookmarkEntities.length / query.pageSize,
    };
    let result = structuredClone(this._bookmarkEntities);
    if (query.collectionId) {
      result = result.filter(item => item.collection.id === query.collectionId);
    }

    const offset = query.pageSize * (query.currentPage - 1);
    const limit = query.pageSize;
    result = result.splice(offset, offset + limit);
    const res = this._createPaginationResponse(result, pagination);
    return of(res);
  }

  create(body: CreateBookmarkDto): Observable<SingleResponseDto<BookmarkDto>> {
    const base = this._createBaseDto();

    const tags = this._tagEntities.filter(item => body.tagIds.includes(item.id));
    const collection = this._collectionEntities.find(
      item => item.id === body.collectionId
    )!;
    const entity: BookmarkDto = {
      ...body,
      ...base,
      collection: collection,
      tags,
    };

    this._bookmarkEntities.push(entity);
    this._syncBookmark();

    const res = this._createSingleResponse(entity);

    return of(res);
  }

  update(
    id: string,
    body: UpdateBookmarkDto
  ): Observable<SingleResponseDto<BookmarkDto>> {
    const indexToUpdate = this._bookmarkEntities.findIndex(item => item.id === id);
    if (indexToUpdate === -1) {
      throw Error("entity not found");
    }
    const entityToUpdate = { ...this._bookmarkEntities[indexToUpdate], ...body };
    entityToUpdate.updateAt = new Date().toISOString();
    this._bookmarkEntities[indexToUpdate] = entityToUpdate;
    this._syncBookmark();

    const res = this._createSingleResponse(entityToUpdate);
    return of(res);
  }

  delete(id: string): Observable<SingleResponseDto<void>> {
    this._bookmarkEntities = this._bookmarkEntities.filter(entity => entity.id === id);
    this._syncBookmark();
    const res = this._createSingleResponse<void>(undefined);
    return of(res);
  }

  private _syncBookmark() {
    this._saveToLocal(this._bookmarkEntities, LocalStorageKeys.Bookmark);
  }
}
