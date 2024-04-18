import { Injectable } from "@angular/core";
import { PaginationMetaDto, PaginationResponseDto, SingleResponseDto } from "@core/http";
import { ResponseAdapter, TagAdapter } from "@shared/adapters";
import { BaseMockApi } from "@shared/data-access";
import { LocalStorageKeys } from "@shared/enums";
import { BookmarkDto, CreateTagDto, TagDto, TagQueryDto, TagVM } from "@shared/models";
import { Observable, map, of } from "rxjs";
import { TagApi } from "./tag.api";

type TagEntity = TagDto & { collectionId: string };

@Injectable()
export class TagMockApi extends BaseMockApi implements TagApi {
  private _entities: TagEntity[] = [];
  private readonly _responseAdapter = new ResponseAdapter();
  private readonly _tagAdapter = new TagAdapter();

  constructor() {
    super();

    this._entities = this._loadFromLocal<BookmarkDto[]>(LocalStorageKeys.Bookmark) ?? [];
  }

  findAll(query: TagQueryDto): Observable<PaginationResponseDto<TagVM>> {
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
      map(res => this._responseAdapter.fromPaginationDto(res, this._tagAdapter))
    );
  }

  create(body: CreateTagDto): Observable<SingleResponseDto<TagVM>> {
    const base = this._createBaseDto();
    const entity: TagEntity = {
      ...body,
      ...base,
    };

    this._entities.push(entity);
    this._syncBookmark();

    const res = this._createSingleResponse(entity);

    return of(res).pipe(
      map(res => this._responseAdapter.fromSingleDto(res, this._tagAdapter))
    );
  }

  private _syncBookmark() {
    this._saveToLocal(this._entities, LocalStorageKeys.Bookmark);
  }
}
