import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CRAWL_ERROR_CODES } from './error-codes.constants';

export const Crawl = {
  NotFound: new NotFoundException({
    message: 'Crawl not found',
    error: CRAWL_ERROR_CODES.NOT_FOUND,
    statusCode: 404,
  }),

  InvalidUrl: (message?: string) =>
    new BadRequestException({
      message: message || 'Invalid URL provided',
      error: CRAWL_ERROR_CODES.INVALID_URL,
      statusCode: 400,
    }),

  UrlRequired: new BadRequestException({
    message: 'URL is required',
    error: CRAWL_ERROR_CODES.URL_REQUIRED,
    statusCode: 400,
  }),

  UrlTooLong: new BadRequestException({
    message: 'URL is too long (maximum 2048 characters)',
    error: CRAWL_ERROR_CODES.URL_TOO_LONG,
    statusCode: 400,
  }),

  UnsupportedProtocol: new BadRequestException({
    message: 'Unsupported protocol. Only HTTP and HTTPS are allowed',
    error: CRAWL_ERROR_CODES.UNSUPPORTED_PROTOCOL,
    statusCode: 400,
  }),

  PrivateUrl: new BadRequestException({
    message: 'Private and local URLs are not allowed',
    error: CRAWL_ERROR_CODES.PRIVATE_URL,
    statusCode: 400,
  }),

  AlreadyExists: new ConflictException({
    message: 'Crawl for this URL already exists and is not expired',
    error: 'CRAWL_ALREADY_EXISTS',
    statusCode: 409,
  }),

  InProgress: new ConflictException({
    message: 'Crawl is currently in progress',
    error: 'CRAWL_IN_PROGRESS',
    statusCode: 409,
  }),

  AlreadyCompleted: new ConflictException({
    message: 'Crawl is already completed',
    error: 'CRAWL_ALREADY_COMPLETED',
    statusCode: 409,
  }),

  CannotRetry: new BadRequestException({
    message:
      'Crawl cannot be retried (maximum retries exceeded or invalid status)',
    error: 'CRAWL_CANNOT_RETRY',
    statusCode: 400,
  }),

  ProcessingFailed: new UnprocessableEntityException({
    message: 'Failed to process crawl request',
    error: 'CRAWL_PROCESSING_FAILED',
    statusCode: 422,
  }),

  Timeout: new UnprocessableEntityException({
    message: 'Crawl request timed out',
    error: 'CRAWL_TIMEOUT',
    statusCode: 422,
  }),

  NetworkError: (message?: string) =>
    new UnprocessableEntityException({
      message: message || 'Network error occurred during crawl',
      error: 'CRAWL_NETWORK_ERROR',
      statusCode: 422,
    }),

  ContentTooLarge: new BadRequestException({
    message: 'Content size exceeds maximum allowed limit',
    error: 'CRAWL_CONTENT_TOO_LARGE',
    statusCode: 400,
  }),

  UnsupportedContentType: new BadRequestException({
    message: 'Unsupported content type for crawling',
    error: 'CRAWL_UNSUPPORTED_CONTENT_TYPE',
    statusCode: 400,
  }),

  RateLimitExceeded: new HttpException(
    {
      message: 'Crawl rate limit exceeded. Please try again later',
      error: 'CRAWL_RATE_LIMIT_EXCEEDED',
    },
    HttpStatus.TOO_MANY_REQUESTS,
  ),

  InvalidCrawlType: new BadRequestException({
    message: 'Invalid crawl type specified',
    error: 'CRAWL_INVALID_TYPE',
    statusCode: 400,
  }),

  ExpiredCrawl: new BadRequestException({
    message: 'Crawl has expired and cannot be accessed',
    error: 'CRAWL_EXPIRED',
    statusCode: 400,
  }),

  AccessDenied: new BadRequestException({
    message: 'Access denied to this crawl',
    error: 'CRAWL_ACCESS_DENIED',
    statusCode: 403,
  }),

  InvalidBatchSize: new BadRequestException({
    message: 'Invalid batch size. Maximum 100 URLs allowed per batch',
    error: 'CRAWL_INVALID_BATCH_SIZE',
    statusCode: 400,
  }),

  EmptyBatch: new BadRequestException({
    message: 'Batch crawl request cannot be empty',
    error: 'CRAWL_EMPTY_BATCH',
    statusCode: 400,
  }),

  MetadataExtractionFailed: new UnprocessableEntityException({
    message: 'Failed to extract metadata from the crawled content',
    error: 'CRAWL_METADATA_EXTRACTION_FAILED',
    statusCode: 422,
  }),

  ScreenshotFailed: new UnprocessableEntityException({
    message: 'Failed to generate screenshot for the URL',
    error: 'CRAWL_SCREENSHOT_FAILED',
    statusCode: 422,
  }),

  InvalidSearchParams: new BadRequestException({
    message: 'Invalid search parameters provided',
    error: 'CRAWL_INVALID_SEARCH_PARAMS',
    statusCode: 400,
  }),

  DatabaseError: new UnprocessableEntityException({
    message: 'Database error occurred while processing crawl',
    error: 'CRAWL_DATABASE_ERROR',
    statusCode: 422,
  }),

  ServiceUnavailable: new UnprocessableEntityException({
    message: 'Crawl service is temporarily unavailable',
    error: 'CRAWL_SERVICE_UNAVAILABLE',
    statusCode: 503,
  }),

  InvalidPagination: new BadRequestException({
    message: 'Invalid pagination parameters',
    error: 'CRAWL_INVALID_PAGINATION',
    statusCode: 400,
  }),

  QuotaExceeded: new HttpException(
    {
      message: 'Crawl quota exceeded for this user',
      error: 'CRAWL_QUOTA_EXCEEDED',
    },
    HttpStatus.TOO_MANY_REQUESTS,
  ),

  InvalidDateRange: new BadRequestException({
    message: 'Invalid date range specified',
    error: 'CRAWL_INVALID_DATE_RANGE',
    statusCode: 400,
  }),

  ConcurrentLimitExceeded: new HttpException(
    {
      message: 'Too many concurrent crawl requests. Please wait and try again',
      error: 'CRAWL_CONCURRENT_LIMIT_EXCEEDED',
    },
    HttpStatus.TOO_MANY_REQUESTS,
  ),

  InvalidConfiguration: new BadRequestException({
    message: 'Invalid crawl configuration provided',
    error: 'CRAWL_INVALID_CONFIGURATION',
    statusCode: 400,
  }),

  ResourceNotAccessible: (message?: string) =>
    new UnprocessableEntityException({
      message: message || 'The requested resource is not accessible',
      error: 'CRAWL_RESOURCE_NOT_ACCESSIBLE',
      statusCode: 422,
    }),

  InvalidResponse: new UnprocessableEntityException({
    message: 'Received invalid response from the target URL',
    error: 'CRAWL_INVALID_RESPONSE',
    statusCode: 422,
  }),

  RedirectLimitExceeded: new UnprocessableEntityException({
    message: 'Too many redirects encountered while crawling',
    error: 'CRAWL_REDIRECT_LIMIT_EXCEEDED',
    statusCode: 422,
  }),

  SecurityViolation: new BadRequestException({
    message: 'Security violation detected in crawl request',
    error: 'CRAWL_SECURITY_VIOLATION',
    statusCode: 400,
  }),

  MaintenanceMode: new UnprocessableEntityException({
    message: 'Crawl service is in maintenance mode',
    error: 'CRAWL_MAINTENANCE_MODE',
    statusCode: 503,
  }),
};
