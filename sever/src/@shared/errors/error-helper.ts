/**
 * Error Helper Utilities
 * Provides utility functions for consistent error handling across the application
 */

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ERROR_MESSAGES, ErrorCode } from './error-codes.constants';

/**
 * Interface for error response structure
 */
export interface ErrorResponse {
  message: string;
  error: string;
  statusCode: number;
  timestamp?: string;
  path?: string;
  details?: any;
}

/**
 * Creates a standardized error response object
 */
export function createErrorResponse(
  errorCode: ErrorCode,
  customMessage?: string,
  details?: any,
): ErrorResponse {
  return {
    message: customMessage || ERROR_MESSAGES[errorCode] || 'An error occurred',
    error: errorCode,
    statusCode: getStatusCodeForError(errorCode),
    timestamp: new Date().toISOString(),
    details,
  };
}

/**
 * Gets the appropriate HTTP status code for an error code
 */
export function getStatusCodeForError(errorCode: ErrorCode): number {
  // Authentication errors
  if (errorCode.startsWith('AUTH_')) {
    if (
      errorCode.includes('UNAUTHORIZED') ||
      errorCode.includes('INVALID_TOKEN') ||
      errorCode.includes('INVALID_CREDENTIALS') ||
      errorCode.includes('ACCESS_DENIED')
    ) {
      return HttpStatus.UNAUTHORIZED;
    }
    if (errorCode.includes('ACCOUNT_LOCKED')) {
      return HttpStatus.LOCKED;
    }
    if (errorCode.includes('ACCOUNT_DISABLED')) {
      return HttpStatus.FORBIDDEN;
    }
    if (errorCode.includes('TOO_MANY_LOGIN_ATTEMPTS')) {
      return HttpStatus.TOO_MANY_REQUESTS;
    }
    return HttpStatus.BAD_REQUEST;
  }

  // User errors
  if (errorCode.startsWith('USER_')) {
    if (errorCode.includes('NOT_FOUND') || errorCode.includes('NOT_EXIST')) {
      return HttpStatus.NOT_FOUND;
    }
    if (errorCode.includes('ALREADY_EXISTS')) {
      return HttpStatus.CONFLICT;
    }
    if (
      errorCode.includes('UPDATE_FAILED') ||
      errorCode.includes('UPLOAD_FAILED')
    ) {
      return HttpStatus.UNPROCESSABLE_ENTITY;
    }
    return HttpStatus.BAD_REQUEST;
  }

  // Collection errors
  if (errorCode.startsWith('COLLECTION_')) {
    if (errorCode.includes('NOT_FOUND')) {
      return HttpStatus.NOT_FOUND;
    }
    if (
      errorCode.includes('ALREADY_EXISTS') ||
      errorCode.includes('HAS_CHILDREN') ||
      errorCode.includes('NOT_EMPTY') ||
      errorCode.includes('ALREADY_DELETED')
    ) {
      return HttpStatus.CONFLICT;
    }
    if (
      errorCode.includes('ACCESS_DENIED') ||
      errorCode.includes('PERMISSION_DENIED')
    ) {
      return HttpStatus.FORBIDDEN;
    }
    return HttpStatus.BAD_REQUEST;
  }

  // Crawl errors
  if (errorCode.startsWith('CRAWL_')) {
    if (errorCode.includes('NOT_FOUND')) {
      return HttpStatus.NOT_FOUND;
    }
    if (
      errorCode.includes('ALREADY_EXISTS') ||
      errorCode.includes('IN_PROGRESS') ||
      errorCode.includes('ALREADY_COMPLETED')
    ) {
      return HttpStatus.CONFLICT;
    }
    if (
      errorCode.includes('RATE_LIMIT') ||
      errorCode.includes('QUOTA_EXCEEDED') ||
      errorCode.includes('CONCURRENT_LIMIT')
    ) {
      return HttpStatus.TOO_MANY_REQUESTS;
    }
    if (
      errorCode.includes('PROCESSING_FAILED') ||
      errorCode.includes('TIMEOUT') ||
      errorCode.includes('NETWORK_ERROR') ||
      errorCode.includes('METADATA_EXTRACTION_FAILED')
    ) {
      return HttpStatus.UNPROCESSABLE_ENTITY;
    }
    if (
      errorCode.includes('SERVICE_UNAVAILABLE') ||
      errorCode.includes('MAINTENANCE_MODE')
    ) {
      return HttpStatus.SERVICE_UNAVAILABLE;
    }
    if (errorCode.includes('ACCESS_DENIED')) {
      return HttpStatus.FORBIDDEN;
    }
    return HttpStatus.BAD_REQUEST;
  }

  // System errors
  if (errorCode.startsWith('SYSTEM_')) {
    if (errorCode.includes('INTERNAL_SERVER_ERROR')) {
      return HttpStatus.INTERNAL_SERVER_ERROR;
    }
    if (
      errorCode.includes('SERVICE_TEMPORARILY_UNAVAILABLE') ||
      errorCode.includes('MAINTENANCE_MODE')
    ) {
      return HttpStatus.SERVICE_UNAVAILABLE;
    }
    if (errorCode.includes('RESOURCE_LIMIT_EXCEEDED')) {
      return HttpStatus.TOO_MANY_REQUESTS;
    }
    return HttpStatus.BAD_REQUEST;
  }

  // File errors
  if (errorCode.startsWith('FILE_')) {
    if (errorCode.includes('NOT_FOUND')) {
      return HttpStatus.NOT_FOUND;
    }
    if (errorCode.includes('ALREADY_EXISTS')) {
      return HttpStatus.CONFLICT;
    }
    if (errorCode.includes('ACCESS_DENIED')) {
      return HttpStatus.FORBIDDEN;
    }
    if (
      errorCode.includes('PROCESSING_FAILED') ||
      errorCode.includes('UPLOAD_FAILED')
    ) {
      return HttpStatus.UNPROCESSABLE_ENTITY;
    }
    return HttpStatus.BAD_REQUEST;
  }

  // Default to bad request
  return HttpStatus.BAD_REQUEST;
}

/**
 * Creates an appropriate HTTP exception based on error code
 */
export function createHttpException(
  errorCode: ErrorCode,
  customMessage?: string,
  details?: any,
): HttpException {
  const errorResponse = createErrorResponse(errorCode, customMessage, details);
  const statusCode = errorResponse.statusCode;

  const exceptionMap = {
    [HttpStatus.BAD_REQUEST]: () => new BadRequestException(errorResponse),
    [HttpStatus.UNAUTHORIZED]: () => new UnauthorizedException(errorResponse),
    [HttpStatus.FORBIDDEN]: () => new ForbiddenException(errorResponse),
    [HttpStatus.NOT_FOUND]: () => new NotFoundException(errorResponse),
    [HttpStatus.CONFLICT]: () => new ConflictException(errorResponse),
    [HttpStatus.UNPROCESSABLE_ENTITY]: () =>
      new UnprocessableEntityException(errorResponse),
    [HttpStatus.TOO_MANY_REQUESTS]: () =>
      new HttpException(errorResponse, HttpStatus.TOO_MANY_REQUESTS),
    [HttpStatus.INTERNAL_SERVER_ERROR]: () =>
      new HttpException(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR),
    [HttpStatus.SERVICE_UNAVAILABLE]: () =>
      new ServiceUnavailableException(errorResponse),
    [HttpStatus.LOCKED]: () =>
      new HttpException(errorResponse, HttpStatus.LOCKED),
  };

  return (
    exceptionMap[statusCode]?.() || new HttpException(errorResponse, statusCode)
  );
}

/**
 * Validates if an error code exists in the system
 */
export function isValidErrorCode(errorCode: string): errorCode is ErrorCode {
  return errorCode in ERROR_MESSAGES;
}

/**
 * Gets all error codes for a specific domain
 */
export function getErrorCodesByDomain(
  domain: 'AUTH' | 'USER' | 'COLLECTION' | 'CRAWL' | 'SYSTEM' | 'FILE',
): ErrorCode[] {
  return Object.values(ERROR_MESSAGES)
    .map((_, index) => Object.keys(ERROR_MESSAGES)[index] as ErrorCode)
    .filter((code) => code.startsWith(`${domain}_`));
}

/**
 * Formats error for logging purposes
 */
export function formatErrorForLogging(
  errorCode: ErrorCode,
  context?: string,
  userId?: string,
  additionalData?: any,
): string {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    errorCode,
    message: ERROR_MESSAGES[errorCode],
    context,
    userId,
    ...additionalData,
  };

  return JSON.stringify(logData, null, 2);
}

/**
 * Error code validation decorator
 */
export function ValidateErrorCode(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor,
) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    // Validate error codes in method arguments if they exist
    args.forEach((arg) => {
      if (
        typeof arg === 'string' &&
        arg.includes('_') &&
        !isValidErrorCode(arg)
      ) {
        console.warn(`Invalid error code detected: ${arg}`);
      }
    });

    return originalMethod.apply(this, args);
  };

  return descriptor;
}

/**
 * Error metrics collection interface
 */
export interface ErrorMetrics {
  errorCode: ErrorCode;
  count: number;
  lastOccurrence: Date;
  contexts: string[];
}

/**
 * Simple in-memory error metrics collector
 */
export class ErrorMetricsCollector {
  private static metrics: Map<ErrorCode, ErrorMetrics> = new Map();

  static recordError(errorCode: ErrorCode, context?: string): void {
    const existing = this.metrics.get(errorCode);

    if (existing) {
      existing.count++;
      existing.lastOccurrence = new Date();
      if (context && !existing.contexts.includes(context)) {
        existing.contexts.push(context);
      }
    } else {
      this.metrics.set(errorCode, {
        errorCode,
        count: 1,
        lastOccurrence: new Date(),
        contexts: context ? [context] : [],
      });
    }
  }

  static getMetrics(): ErrorMetrics[] {
    return Array.from(this.metrics.values());
  }

  static getMetricsForDomain(domain: string): ErrorMetrics[] {
    return this.getMetrics().filter((metric) =>
      metric.errorCode.startsWith(`${domain.toUpperCase()}_`),
    );
  }

  static clearMetrics(): void {
    this.metrics.clear();
  }
}
