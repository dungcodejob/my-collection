import { Injectable } from "@angular/core";
import { ListResponseDto, SingleResponseDto } from "@core/http";
import { BaseMockApi } from "@shared/data-access";
import { LocalStorageKeys } from "@shared/enums";
import {
  CollectionDto,
  CreateCollectionDto,
  MoveCollectionDto,
  UpdateCollectionDto,
} from "@shared/models";
import { Observable, of } from "rxjs";
import { CollectionApi } from "./collection.api";

@Injectable()
export class CollectionMockApi extends BaseMockApi implements CollectionApi {
  private _entities: CollectionDto[] = [];

  constructor() {
    super();

    this._entities =
      this._loadFromLocal<CollectionDto[]>(LocalStorageKeys.Collection) ?? [];
  }

  findAll(): Observable<ListResponseDto<CollectionDto>> {
    const res = this._createListResponse(this._entities, this._entities.length);

    return of(res);
  }

  create(body: CreateCollectionDto): Observable<SingleResponseDto<CollectionDto>> {
    const base = this._createBaseDto();
    const entity: CollectionDto = {
      ...body,
      ...base,
      position: `${new Date().getTime()}`,
    };

    this._entities.push(entity);
    this._syncCollection();

    const res = this._createSingleResponse(entity);

    return of(res);
  }

  update(
    id: string,
    body: UpdateCollectionDto
  ): Observable<SingleResponseDto<CollectionDto>> {
    const indexToUpdate = this._entities.findIndex(item => item.id === id);
    if (indexToUpdate === -1) {
      throw Error("entity not found");
    }
    const entityToUpdate = { ...this._entities[indexToUpdate], ...body };
    entityToUpdate.updateAt = new Date().toISOString();
    this._entities[indexToUpdate] = entityToUpdate;
    this._syncCollection();

    const res = this._createSingleResponse(entityToUpdate);
    return of(res);
  }

  delete(id: string): Observable<SingleResponseDto<void>> {
    this._entities = this._entities.filter(entity => entity.id === id);
    this._syncCollection();
    const res = this._createSingleResponse<void>(undefined);
    return of(res);
  }

  move(
    id: string,
    body: MoveCollectionDto
  ): Observable<SingleResponseDto<CollectionDto>> {
    const indexToUpdate = this._entities.findIndex(item => item.id === id);
    if (indexToUpdate === -1) {
      throw Error("entity not found");
    }
    const entityToUpdate = { ...this._entities[indexToUpdate], ...body };
    entityToUpdate.updateAt = new Date().toISOString();
    this._entities[indexToUpdate] = entityToUpdate;
    this._syncCollection();

    const res = this._createSingleResponse(entityToUpdate);
    return of(res);
  }

  private _syncCollection() {
    this._saveToLocal(this._entities, LocalStorageKeys.Collection);
  }
}
