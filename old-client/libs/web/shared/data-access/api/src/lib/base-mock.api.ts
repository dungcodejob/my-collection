import { HttpHeaders } from "@angular/common/http";
import { inject } from "@angular/core";
import {
  HttpMethod,
  SuccessResponseDto,
  ErrorResponseDto,
  BaseResponseDto,
} from "@nx/web-shared-http";
import { LocalStorageService } from "@nx/web-shared-services";
import { of } from "rxjs";

export abstract class BaseMockApi {
  protected readonly _storageService = inject(LocalStorageService);

  readonly headers = new HttpHeaders({ "Content-Type": "application/json" });
  readonly options = { headers: this.headers, withCredentials: true };

  protected _createSuccessResponseDto<T>(config: {
    url: string;
    method: HttpMethod;
    result: T;
  }): SuccessResponseDto<T> {
    const res: SuccessResponseDto<T> = {
      statusCode: 200,
      message: "Request successful",
      timestamp: new Date().toISOString(),
      url: config.url,
      method: config.method,
      success: true,
      result: config.result,
    };

    return res;
  }

  protected _createServerErrorResponseDto(config: {
    url: string;
    method: HttpMethod;
  }): ErrorResponseDto {
    const serverErrorResponse: BaseResponseDto = {
      statusCode: 500,
      message: "Internal server error",
      description: "An unexpected error occurred on the server.",
      timestamp: new Date().toISOString(),
      url: config.url,
      method: config.method,
    };

    return {
      ...serverErrorResponse,
      success: false,
      errorCode: "500",
    };
  }

  protected _createNotFoundResponseDto(config: {
    url: string;
    method: HttpMethod;
  }): ErrorResponseDto {
    const notFoundResponse: BaseResponseDto = {
      statusCode: 404,
      message: "Resource not found",
      description: "The requested user does not exist.",
      timestamp: new Date().toISOString(),
      url: config.url,
      method: config.method,
    };

    return {
      ...notFoundResponse,
      success: false,
      errorCode: "404",
    };
  }

  protected _createBadRequestResponseDto(config: {
    url: string;
    method: HttpMethod;
  }): ErrorResponseDto {
    const notFoundResponse: BaseResponseDto = {
      statusCode: 400,
      message: "Bad request",
      description: "Invalid input data.",
      timestamp: new Date().toISOString(),
      url: config.url,
      method: config.method,
    };

    return {
      ...notFoundResponse,
      success: false,
      errorCode: "400",
    };
  }

  protected _get<T>(config: { url: string; result: T }) {
    return this._createSuccessResponseDto({
      ...config,
      method: "GET",
    });
  }

  protected _post<T>(config: { url: string; result: T }) {
    return of(
      this._createSuccessResponseDto({
        ...config,
        method: "POST",
      })
    );
  }

  protected _put<T>(config: { url: string; result: T }) {
    return of(
      this._createSuccessResponseDto({
        ...config,
        method: "PUT",
      })
    );
  }

  protected _delete<T>(config: { url: string; result: T }) {
    return of(
      this._createSuccessResponseDto({
        ...config,
        method: "DELETE",
      })
    );
  }
}
