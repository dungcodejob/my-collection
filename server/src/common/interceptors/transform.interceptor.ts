import { ResponseKey } from '@common/constants';
import {
    ErrorResponseDto,
    ListResponseDto,
    PaginationResponseDto,
    SingleResponseDto,
    ValidatorResponseDto,
} from '@common/models';
import {
    CallHandler,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ValidationError } from 'class-validator';
import { Request, Response } from 'express';
import { Observable, catchError, map, throwError } from 'rxjs';

type ResponseSuccessDto<T> =
  | SingleResponseDto<T>
  | ListResponseDto<T>
  | PaginationResponseDto<T>;

type ResponseFailureDto = ErrorResponseDto | ValidatorResponseDto;

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((result) => this._handleResponse(result, context)),
      catchError((err) => throwError(() => this._handleError(err, context))),
    );
  }

  private _handleResponse(result: any, context: ExecutionContext): void {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = response.statusCode;
    const message =
      this.reflector.get(ResponseKey.Message, context.getHandler()) || '';

    console.log(this.reflector.get(ResponseKey.Message, context.getHandler()));
    // const message = response["message"] ?? "";

    const body: ResponseSuccessDto<T> = {
      statusCode: status,
      success: true,
      message,
      result,
      timestamp: new Date().toISOString(),
      url: request.url,
      method: request.method,
    };

    response.status(HttpStatus.OK).json(body);
  }

  private _handleError(
    exception: HttpException,
    context: ExecutionContext,
  ): void {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status = exception.getStatus() ?? HttpStatus.INTERNAL_SERVER_ERROR;

    let message = exception.message;
    let result = null;
    if (status === HttpStatus.BAD_REQUEST) {
      const content = exception.getResponse()['message'] as unknown;
      if (Array.isArray(content)) {
        result = {
          meta: { validators: content as ValidationError[] },
        };
      }
    }

    if (status === HttpStatus.UNAUTHORIZED) {
      if (typeof exception.message !== 'string') {
        message = 'You do not have permission to access this resource.';
      }
    }

    const body: ResponseFailureDto = {
      statusCode: status,
      success: false,
      message,
      result,
      timestamp: new Date().toISOString(),
      url: request.url,
      method: request.method,
    };

    response.status(HttpStatus.OK).json(body);
  }
}
