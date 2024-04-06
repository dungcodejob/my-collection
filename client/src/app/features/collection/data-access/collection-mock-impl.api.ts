import { Injectable } from "@angular/core";
import {
  ListResponseDto,
  ResponseDto,
  SingleResponseDto,
  SingleResult,
} from "@core/http";
import {
  CollectionDto,
  CreateCollectionDto,
  MoveCollectionDto,
  UpdateCollectionDto,
} from "@shared/models";
import { Observable, delay, of } from "rxjs";
import { CollectionApi } from "./collection.api";

@Injectable()
export class CollectionMockImplApi implements CollectionApi {
  private _baseResponse: Omit<ResponseDto, "result"> = {
    statusCode: 200,
    success: true,
    message: "Fake success message",
    timestamp: new Date().toISOString(),
    url: "https://example.com/api",
    method: "POST",
  };

  private collections: CollectionDto[] = [];
  constructor() {
    // Initialize mock data
    for (let i = 1; i <= 5; i++) {
      this.collections.push({
        id: i.toString(),
        title: `Collection ${i}`,
        icon: `icon-${i}`,
        position: `position-${i}`,
        updateAt: new Date(),
        createAt: new Date(),
      });
    }
  }
  move(
    id: string,
    body: MoveCollectionDto
  ): Observable<
    Readonly<{
      statusCode: number;
      success: boolean;
      message: string;
      description?: string | undefined;
      result: Readonly<SingleResult<CollectionDto>>;
      timestamp: string;
      url: string;
      method: string;
    }>
  > {
    throw new Error("Method not implemented.");
  }

  findAll(): Observable<ListResponseDto<CollectionDto>> {
    const response = this._createListResponse(this.collections);
    return of(response).pipe(delay(500)); // Simulate delay to mimic network latency
  }

  create(body: CreateCollectionDto): Observable<SingleResponseDto<CollectionDto>> {
    const newCollection: CollectionDto = {
      id: (this.collections.length + 1).toString(),
      title: body.title,
      icon: body.icon,
      position: `position`,
      updateAt: new Date(),
      createAt: new Date(),
    };
    this.collections.push(newCollection);

    const res = this._createSingleResponse(newCollection);

    return of(res).pipe(delay(500)); // Simulate delay to mimic network latency
  }

  update(
    id: string,
    body: UpdateCollectionDto
  ): Observable<SingleResponseDto<CollectionDto>> {
    const index = this.collections.findIndex(collection => collection.id === id);

    this.collections[index] = { ...this.collections[index], ...body };
    // this.collections[index].updateAt = new Date();
    const response = this._createSingleResponse(this.collections[index]);
    return of(response).pipe(delay(500)); // Simulate delay to mimic network latency
  }

  delete(id: string): Observable<SingleResponseDto<void>> {
    this.collections = this.collections.filter(item => item.id === id);

    const response = this._createSingleResponse<void>(undefined);
    return of(response).pipe(delay(500)); // Simulate delay to mimic network latency
  }

  private _createListResponse<T>(data: T[]): ListResponseDto<T> {
    return {
      ...this._baseResponse,
      result: { items: data, meta: { count: data.length } },
    };
  }

  private _createSingleResponse<T>(data: T): SingleResponseDto<T> {
    return {
      ...this._baseResponse,
      result: { data },
    };
  }
}
