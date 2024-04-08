import {
  ListResponseDto,
  PaginationResponseDto,
  ResponseDto,
  SingleResponseDto,
} from "@core/http";
import { ViewModelAdapter } from "./view-model.adapter";

export class ResponseAdapter {
  fromSingleDto<TDto, TViewModel = unknown>(
    dto: SingleResponseDto<TDto>,
    adapter: ViewModelAdapter<TDto, TViewModel>
  ): SingleResponseDto<TViewModel> {
    const base = this._fromBaseDto(dto);
    return {
      ...base,
      result: { data: adapter.fromDto(dto.result.data) },
    };
  }

  fromListDto<TDto, TViewModel = unknown>(
    dto: ListResponseDto<TDto>,
    adapter: ViewModelAdapter<TDto, TViewModel>
  ): ListResponseDto<TViewModel> {
    const base = this._fromBaseDto(dto);
    return {
      ...base,
      result: {
        items: adapter.fromDto(dto.result.items),
        meta: dto.result.meta,
      },
    };
  }

  fromPaginationDto<TDto, TViewModel = unknown>(
    dto: PaginationResponseDto<TDto>,
    adapter: ViewModelAdapter<TDto, TViewModel>
  ): PaginationResponseDto<TViewModel> {
    const base = this._fromBaseDto(dto);
    return {
      ...base,
      result: {
        items: adapter.fromDto(dto.result.items),
        meta: dto.result.meta,
      },
    };
  }

  private _fromBaseDto(dto: Omit<ResponseDto, "result">): Omit<ResponseDto, "result"> {
    return {
      statusCode: dto.statusCode,
      success: dto.success,
      message: dto.message,
      description: dto.description,
      timestamp: dto.timestamp,
      url: dto.url,
      method: dto.method,
    };
  }
}
