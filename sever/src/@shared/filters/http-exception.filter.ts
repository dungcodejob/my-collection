import {
  FileImportValidatorException,
  ValidatorException,
  ValidatorResponseDto,
} from '@app/models';
import { DriverException } from '@mikro-orm/core';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
/**
 * Global Exception Filter
 * Handles all exceptions (Guards, Controllers, etc.) with consistent format
 * Works alongside TransformInterceptor to ensure uniform response structure
 */
@Injectable()
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private reflector: Reflector) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    console.error('Exception thrown:', exception);

    const ctx = host.switchToHttp();
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

      // Handle validation exceptions
      if (
        exception instanceof ValidatorException ||
        exception instanceof FileImportValidatorException
      ) {
        errorCode = exception.message;
        result = {
          meta: exception.meta,
        };
      }

      if (exception instanceof UnprocessableEntityException) {
        errorCode = exception.message;
        result = exception.getResponse() as ValidatorResponseDto['result'];
      }

      // Handle unauthorized exceptions
      if (status === HttpStatus.UNAUTHORIZED) {
        if (typeof exception.message !== 'string') {
          message = 'You do not have permission to access this resource.';
        }
        errorCode = 'Auth.Unauthorized';
      }
    } else if (exception instanceof DriverException) {
      errorCode = 'App.MikroORM';
      message = exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Create consistent response format (same as TransformInterceptor)
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

    // Always return 200 with error in body (consistent with TransformInterceptor)
    response.status(HttpStatus.OK).send(body);
  }
}
