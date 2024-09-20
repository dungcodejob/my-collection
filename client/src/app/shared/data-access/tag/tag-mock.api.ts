import { Injectable } from "@angular/core";
import { PaginationMetaDto, PaginationResponseDto, SingleResponseDto } from "@core/http";
import { ResponseAdapter, TagAdapter } from "@shared/adapters";
import { BaseMockApi } from "@shared/data-access";
import { LocalStorageKeys } from "@shared/enums";
import { CreateTagDto, TagDto, TagQueryDto } from "@shared/models";
import { Observable, of } from "rxjs";
import { TagApi } from "./tag.api";

type TagEntity = TagDto & { collectionId: string };

@Injectable()
export class TagMockApi extends BaseMockApi implements TagApi {
  private _entities: TagEntity[] = [
    {
      id: "m7cjcvr3",
      updateAt: "2024-04-19T12:30:00.000Z",
      createAt: "2024-04-19T12:30:00.000Z",
      title: "Art",
      collectionId: "1713425712492",
    },
    {
      id: "f0qhhp26",
      updateAt: "2024-04-19T12:30:00.000Z",
      createAt: "2024-04-19T12:30:00.000Z",
      title: "Science",
      collectionId: "1713425712492",
    },
    {
      id: "wct2jioe",
      updateAt: "2024-04-19T12:30:00.000Z",
      createAt: "2024-04-19T12:30:00.000Z",
      title: "History",
      collectionId: "1713425712492",
    },
    {
      id: "2t05bzur",
      updateAt: "2024-04-19T12:30:00.000Z",
      createAt: "2024-04-19T12:30:00.000Z",
      title: "Nature",
      collectionId: "1713425712492",
    },
    {
      id: "ng1hzrgh",
      updateAt: "2024-04-19T12:30:00.000Z",
      createAt: "2024-04-19T12:30:00.000Z",
      title: "Art",
      collectionId: "1713425712492",
    },
  ];
  private readonly _responseAdapter = new ResponseAdapter();
  private readonly _tagAdapter = new TagAdapter();

  constructor() {
    super();

    this._entities = this._loadFromLocal<TagDto[]>(LocalStorageKeys.Tag) ?? [];
  }

  findAll(query: TagQueryDto): Observable<PaginationResponseDto<TagDto>> {
    const pagination: PaginationMetaDto = {
      currentPage: query.currentPage,
      pageSize: query.pageSize,
      hasNext: true,
      hasPrevious: true,
      totalCount: this._entities.length,
      totalPages: this._entities.length / query.pageSize,
    };
    let result = structuredClone(this._entities);
    if (query.collectionId) {
      result = result.filter(item => item.collectionId === query.collectionId);
    }
    if (query.keyword) {
      result = result.filter(item =>
        item.title.toLocaleLowerCase().includes(query.keyword?.toLocaleLowerCase() ?? "")
      );
    }

    const offset = query.pageSize * (query.currentPage - 1);
    const limit = query.pageSize;
    result = result.splice(offset, offset + limit);

    const res = this._createPaginationResponse(result, pagination);
    return of(res);
  }

  create(body: CreateTagDto): Observable<SingleResponseDto<TagDto>> {
    const base = this._createBaseDto();
    const entity: TagEntity = {
      ...body,
      ...base,
    };

    this._entities.push(entity);
    this._syncBookmark();

    const res = this._createSingleResponse(entity);

    return of(res);
  }

  private _syncBookmark() {
    this._saveToLocal(this._entities, LocalStorageKeys.Tag);
  }
}
