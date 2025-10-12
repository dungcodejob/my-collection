import {
  DateFieldOptional,
  EnumField,
  NumberFieldOptional,
  StringField,
  StringFieldOptional,
} from '@app/decorators';
import { CrawlType, CrawlStatus } from '@app/entities';

/**
 * DTO for creating a new crawl request
 */
export class CrawlRequestDto {
  @StringField({
    description: 'URL to crawl',
    example: 'https://example.com',
    maxLength: 2048,
  })
  url: string;

  @EnumField(() => CrawlType, {
    description: 'Type of crawl to perform',
    example: CrawlType.METADATA,
  })
  crawlType: CrawlType;

  @DateFieldOptional({
    description: 'Expiration date for crawl result',
  })
  expiresAt?: Date;
}

/**
 * DTO for batch crawl requests
 */
export class BatchCrawlRequestDto {
  @StringField({
    description: 'Array of URLs to crawl',
    each: true,
    maxLength: 2048,
  })
  urls: string[];

  @EnumField(() => CrawlType, {
    description: 'Type of crawl to perform for all URLs',
    example: CrawlType.METADATA,
  })
  crawlType: CrawlType;

  @DateFieldOptional({
    description: 'Expiration date for crawl results',
  })
  expiresAt?: Date;
}

/**
 * DTO for crawl retry request
 */
export class CrawlRetryDto {
  @StringField({
    description: 'Crawl ID to retry',
  })
  crawlId: string;

  @EnumField(() => CrawlType, {
    description: 'Type of crawl to perform',
    example: CrawlType.METADATA,
  })
  crawlType: CrawlType;
}

/**
 * DTO for URL validation request
 */
export class UrlValidationDto {
  @StringField({
    description: 'URL to validate',
    example: 'https://example.com',
    maxLength: 2048,
  })
  url: string;
}

/**
 * DTO for crawl search/filter parameters
 */
export class CrawlSearchDto {
  @StringFieldOptional({
    description: 'Search term for URL, title, description, or site name',
    maxLength: 255,
  })
  search?: string;

  @EnumField(() => CrawlStatus, {
    description: 'Filter by crawl status',
    required: false,
  })
  status?: CrawlStatus;

  @EnumField(() => CrawlType, {
    description: 'Filter by crawl type',
    required: false,
  })
  crawlType?: CrawlType;

  @NumberFieldOptional({
    description: 'Page offset for pagination',
    min: 0,
    int: true,
  })
  offset?: number;

  @NumberFieldOptional({
    description: 'Number of items per page',
    min: 1,
    max: 100,
    int: true,
  })
  limit?: number;
}
