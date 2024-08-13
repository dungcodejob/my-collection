import { Injectable } from "@angular/core";
import { ListResponseDto, SingleResponseDto } from "@core/http";
import { CollectionAdapter, ResponseAdapter } from "@shared/adapters";
import { BaseMockApi } from "@shared/data-access";
import { LocalStorageKeys } from "@shared/enums";
import {
  CollectionDto,
  CollectionVM,
  CreateCollectionDto,
  MoveCollectionDto,
  UpdateCollectionDto,
} from "@shared/models";
import { Observable, map, of } from "rxjs";
import { CollectionApi } from "./collection.api";

@Injectable()
export class CollectionMockApi extends BaseMockApi implements CollectionApi {
  private _entities: CollectionDto[] = [];
  private readonly _responseAdapter = new ResponseAdapter();
  private readonly _collectionAdapter = new CollectionAdapter();

  constructor() {
    super();

    this._entities =
      this._loadFromLocal<CollectionDto[]>(LocalStorageKeys.Collection) ?? [];
  }

  findAll(): Observable<ListResponseDto<CollectionVM>> {
    const res = this._createListResponse(this._entities, this._entities.length);

    return of(res).pipe(
      map(res => this._responseAdapter.fromListDto(res, this._collectionAdapter))
    );
  }

  create(body: CreateCollectionDto): Observable<SingleResponseDto<CollectionVM>> {
    const base = this._createBaseDto();
    const entity: CollectionDto = {
      ...body,
      ...base,
      position: `${new Date().getTime()}`,
    };

    this._entities.push(entity);
    this._syncCollection();

    const res = this._createSingleResponse(entity);

    return of(res).pipe(
      map(res => this._responseAdapter.fromSingleDto(res, this._collectionAdapter))
    );
  }

  update(
    id: string,
    body: UpdateCollectionDto
  ): Observable<SingleResponseDto<CollectionVM>> {
    const indexToUpdate = this._entities.findIndex(item => item.id === id);
    if (indexToUpdate === -1) {
      throw Error("entity not found");
    }
    const entityToUpdate = { ...this._entities[indexToUpdate], ...body };
    entityToUpdate.updateAt = new Date().toISOString();
    this._entities[indexToUpdate] = entityToUpdate;
    this._syncCollection();

    const res = this._createSingleResponse(entityToUpdate);
    return of(res).pipe(
      map(res => this._responseAdapter.fromSingleDto(res, this._collectionAdapter))
    );
  }

  delete(id: string): Observable<SingleResponseDto<void>> {
    this._entities = this._entities.filter(entity => entity.id === id);
    this._syncCollection();
    const res = this._createSingleResponse<void>(undefined);
    return of(res);
  }

  move(id: string, body: MoveCollectionDto): Observable<SingleResponseDto<CollectionVM>> {
    const indexToUpdate = this._entities.findIndex(item => item.id === id);
    if (indexToUpdate === -1) {
      throw Error("entity not found");
    }
    const entityToUpdate = { ...this._entities[indexToUpdate], ...body };
    entityToUpdate.updateAt = new Date().toISOString();
    this._entities[indexToUpdate] = entityToUpdate;
    this._syncCollection();

    const res = this._createSingleResponse(entityToUpdate);
    return of(res).pipe(
      map(res => this._responseAdapter.fromSingleDto(res, this._collectionAdapter))
    );
  }

  private _syncCollection() {
    this._saveToLocal(this._entities, LocalStorageKeys.Collection);
  }
}
