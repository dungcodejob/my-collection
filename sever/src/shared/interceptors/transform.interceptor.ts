import { RESPONSE_KEY } from '@app/constants';
import {
  FileImportValidatorException,
  SuccessResponseDto,
  ValidatorException,
  ValidatorResponseDto,
} from '@app/models';
import { DriverException } from '@mikro-orm/core';
import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { Observable, catchError, map, throwError } from 'rxjs';

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

    const status = response.statusCode || HttpStatus.OK;
    const message =
      this.reflector.get(RESPONSE_KEY.MESSAGE, context.getHandler()) || '';
    // const message = response["message"] ?? "";

    const body: SuccessResponseDto<T> = {
      statusCode: status,
      success: true,
      message,
      result,
      timestamp: new Date().toISOString(),
      url: request.url,
      method: request.method,
    };

    response.status(status).send(body);
  }

  private _handleError(exception: unknown, context: ExecutionContext): void {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';
    let result: ValidatorResponseDto['result'] = null;
    let errorCode = 'App.InternalServerError';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
      errorCode = exception.message;

      if (
        exception instanceof ValidatorException ||
        exception instanceof FileImportValidatorException
      ) {
        errorCode = exception.message;

        result = {
          meta: exception.meta,
        };
      }

      if (status === HttpStatus.UNAUTHORIZED) {
        if (typeof exception.message !== 'string') {
          message = 'You do not have permission to access this resource.';
        }
      }
    } else if (exception instanceof DriverException) {
      errorCode = 'App.MikroORM';
      message = exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const body: ValidatorResponseDto = {
      statusCode: status,
      errorCode,
      success: false,
      message,
      result,
      timestamp: new Date().toISOString(),
      url: request.url,
      method: request.method,
    };

    response.status(HttpStatus.OK).send(body);
  }
}
