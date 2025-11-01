import {
  BooleanField,
  DateField,
  DateFieldOptional,
  EnumField,
  NumberField,
  NumberFieldOptional,
  StringField,
  StringFieldOptional,
} from '@app/decorators';
import { CrawlStatus, CrawlType } from '@app/entities';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for crawl response
 */
export class CrawlResponseDto {
  @StringField({ description: 'Crawl ID' })
  id: string;

  @StringField({ description: 'Crawled URL' })
  url: string;

  @EnumField(() => CrawlStatus, {
    description: 'Crawl status',
  })
  status: CrawlStatus;

  @EnumField(() => CrawlType, {
    description: 'Crawl type',
  })
  crawlType: CrawlType;

  @StringFieldOptional({ description: 'Page title' })
  title?: string;

  @StringFieldOptional({ description: 'Page description' })
  description?: string;

  @StringFieldOptional({ description: 'Page image URL' })
  imageUrl?: string;

  @StringFieldOptional({ description: 'Site name' })
  siteName?: string;

  @StringFieldOptional({ description: 'Content type' })
  contentType?: string;

  @NumberFieldOptional({ description: 'Content length in bytes' })
  contentLength?: number;

  @ApiProperty({ description: 'Additional metadata', required: false })
  metadata?: Record<string, any>;

  @StringFieldOptional({ description: 'Screenshot URL' })
  screenshotUrl?: string;

  @NumberFieldOptional({ description: 'Crawl duration in milliseconds' })
  crawlDuration?: number;

  @StringFieldOptional({ description: 'Error message if failed' })
  errorMessage?: string;

  @NumberField({ description: 'Retry count', int: true, min: 0 })
  retryCount: number;

  @DateFieldOptional({ description: 'Last crawled date' })
  lastCrawledAt?: Date;

  @DateFieldOptional({ description: 'Expiration date' })
  expiresAt?: Date;

  @BooleanField({ description: 'Whether crawl is active' })
  isActive: boolean;

  @DateField({ description: 'Creation date' })
  createdAt: Date;

  @DateField({ description: 'Last update date' })
  updatedAt: Date;
}

/**
 * DTO for crawl metadata response
 */
export class CrawlMetadataDto {
  @StringField({ description: 'Page title' })
  title: string;

  @StringFieldOptional({ description: 'Page description' })
  description?: string;

  @StringFieldOptional({ description: 'Page image URL' })
  imageUrl?: string;

  @StringFieldOptional({ description: 'Site name' })
  siteName?: string;

  @StringFieldOptional({ description: 'Content type' })
  contentType?: string;

  @NumberFieldOptional({ description: 'Content length in bytes' })
  contentLength?: number;

  @ApiProperty({ description: 'Additional metadata', required: false })
  metadata?: Record<string, any>;
}

/**
 * DTO for crawl summary response
 */
export class CrawlSummaryDto {
  @StringField({ description: 'Crawl ID' })
  id: string;

  @StringField({ description: 'Crawled URL' })
  url: string;

  @EnumField(() => CrawlStatus, {
    description: 'Crawl status',
  })
  status: CrawlStatus;

  @StringFieldOptional({ description: 'Page title' })
  title?: string;

  @StringFieldOptional({ description: 'Page description' })
  description?: string;

  @StringFieldOptional({ description: 'Page image URL' })
  imageUrl?: string;

  @NumberFieldOptional({ description: 'Crawl duration in milliseconds' })
  crawlDuration?: number;

  @DateField({ description: 'Creation date' })
  createdAt: Date;
}

/**
 * DTO for paginated crawl response
 */
export class CrawlWithPaginationResponseDto {
  @ApiProperty({
    description: 'Crawls array',
    type: [CrawlResponseDto],
  })
  crawls: CrawlResponseDto[];

  @NumberField({
    description: 'Total count of crawls',
    int: true,
    min: 0,
  })
  total: number;

  @NumberField({
    description: 'Current offset',
    int: true,
    min: 0,
  })
  offset: number;

  @NumberField({
    description: 'Items per page',
    int: true,
    min: 1,
  })
  limit: number;
}

/**
 * DTO for crawl statistics
 */
export class CrawlStatsDto {
  @NumberField({
    description: 'Total crawls count',
    int: true,
    min: 0,
  })
  total: number;

  @NumberField({
    description: 'Pending crawls count',
    int: true,
    min: 0,
  })
  pending: number;

  @NumberField({
    description: 'Processing crawls count',
    int: true,
    min: 0,
  })
  processing: number;

  @NumberField({
    description: 'Completed crawls count',
    int: true,
    min: 0,
  })
  completed: number;

  @NumberField({
    description: 'Failed crawls count',
    int: true,
    min: 0,
  })
  failed: number;

  @NumberField({
    description: 'Timeout crawls count',
    int: true,
    min: 0,
  })
  timeout: number;
}

/**
 * DTO for URL validation response
 */
export class UrlValidationResponseDto {
  @StringField({ description: 'Validated URL' })
  url: string;

  @BooleanField({ description: 'Whether URL is valid' })
  isValid: boolean;

  @StringFieldOptional({ description: 'Validation error message' })
  errorMessage?: string;

  @StringFieldOptional({ description: 'Normalized URL' })
  normalizedUrl?: string;
}

/**
 * DTO for batch crawl response
 */
export class BatchCrawlResponseDto {
  @ApiProperty({
    description: 'Created crawls',
    type: [CrawlResponseDto],
  })
  crawls: CrawlResponseDto[];

  @NumberField({
    description: 'Total URLs processed',
    int: true,
    min: 0,
  })
  totalProcessed: number;

  @NumberField({
    description: 'Successfully created crawls',
    int: true,
    min: 0,
  })
  successCount: number;

  @NumberField({
    description: 'Failed to create crawls',
    int: true,
    min: 0,
  })
  failureCount: number;

  @ApiProperty({
    description: 'Failed URLs with error messages',
    required: false,
  })
  failures?: Array<{
    url: string;
    error: string;
  }>;
}
