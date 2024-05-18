import { Injectable, inject } from "@angular/core";
import {
  ListResponseDto,
  PaginationMetaDto,
  PaginationResponseDto,
  ResponseDto,
  SingleResponseDto,
} from "@core/http";
import { BaseDto } from "@shared/models";
import { LocalStorageService } from "@shared/services";

@Injectable({ providedIn: "root" })
export class BaseMockApi {
  private readonly _localStorage = inject(LocalStorageService);

  constructor() {}

  protected _createBaseDto(): BaseDto {
    return {
      id: `${new Date().getTime()}`,
      createAt: new Date().toString(),
      updateAt: new Date().toString(),
    };
  }
  protected _createSingleResponse<T>(data: T): SingleResponseDto<T> {
    const res = this._createBaseResponse();
    return {
      ...res,
      result: { data },
    };
  }

  protected _createListResponse<T>(items: T[], count: number): ListResponseDto<T> {
    const res = this._createBaseResponse();
    return {
      ...res,
      result: { items, meta: { count } },
    };
  }

  protected _createPaginationResponse<T>(
    items: T[],
    pagination: PaginationMetaDto
  ): PaginationResponseDto<T> {
    const res = this._createBaseResponse();
    return {
      ...res,
      result: {
        items,
        meta: {
          pagination,
        },
      },
    };
  }

  protected _loadFromLocal<T>(key: string): T | null {
    return this._localStorage.getObject<T>(key);
  }

  protected _saveToLocal<T>(data: T, key: string): void {
    this._localStorage.setObject(key, data);
  }

  private _createBaseResponse(): Omit<ResponseDto, "result"> {
    return {
      statusCode: 200,
      method: "POST",
      success: true,
      message: "Success",
      timestamp: new Date().toISOString(),
      url: "http://localhost",
    };
  }
}
