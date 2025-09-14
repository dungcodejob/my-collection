import { CrawlEntity, CrawlStatus } from '@app/entities';
import { Injectable } from '@nestjs/common';
import { CrawlMetadataDto, CrawlResponseDto, CrawlSummaryDto } from './models';

@Injectable()
export class CrawlMapper {
  /**
   * Convert CrawlEntity to CrawlResponseDto
   */
  toResponseDto(entity: CrawlEntity): CrawlResponseDto {
    return {
      id: entity.id,
      url: entity.url,
      status: entity.status,
      crawlType: entity.crawlType,
      title: entity.title,
      description: entity.description,
      imageUrl: entity.imageUrl,
      siteName: entity.siteName,
      contentType: entity.contentType,
      contentLength: entity.contentLength,
      metadata: entity.metadata,
      screenshotUrl: entity.screenshotUrl,
      crawlDuration: entity.crawlDuration,
      errorMessage: entity.errorMessage,
      retryCount: entity.retryCount,
      lastCrawledAt: entity.lastCrawledAt,
      expiresAt: entity.expiresAt,
      isActive: entity.isActive,
      createdAt: entity.createAt || new Date(),
      updatedAt: entity.updateAt || new Date(),
    };
  }

  /**
   * Convert CrawlEntity to CrawlSummaryDto
   */
  toSummaryDto(entity: CrawlEntity): CrawlSummaryDto {
    return {
      id: entity.id,
      url: entity.url,
      status: entity.status,
      title: entity.title,
      description: entity.description,
      imageUrl: entity.imageUrl,
      crawlDuration: entity.crawlDuration,
      createdAt: entity.createAt || new Date(),
    };
  }

  /**
   * Convert CrawlEntity to CrawlMetadataDto
   */
  toMetadataDto(entity: CrawlEntity): CrawlMetadataDto {
    return {
      title: entity.title || 'Unknown',
      description: entity.description,
      imageUrl: entity.imageUrl,
      siteName: entity.siteName,
      contentType: entity.contentType,
      contentLength: entity.contentLength,
      metadata: entity.metadata,
    };
  }

  /**
   * Convert array of CrawlEntity to array of CrawlResponseDto
   */
  toResponseDtoArray(entities: CrawlEntity[]): CrawlResponseDto[] {
    return entities.map((entity) => this.toResponseDto(entity));
  }

  /**
   * Convert array of CrawlEntity to array of CrawlSummaryDto
   */
  toSummaryDtoArray(entities: CrawlEntity[]): CrawlSummaryDto[] {
    return entities.map((entity) => this.toSummaryDto(entity));
  }

  /**
   * Convert CrawlEntity to simple object for internal use
   */
  toSimpleObject(entity: CrawlEntity): {
    id: string;
    url: string;
    status: string;
    title?: string;
    crawlDuration?: number;
  } {
    return {
      id: entity.id,
      url: entity.url,
      status: entity.status,
      title: entity.title,
      crawlDuration: entity.crawlDuration,
    };
  }

  /**
   * Convert CrawlEntity to search result format
   */
  toSearchResult(entity: CrawlEntity): {
    id: string;
    url: string;
    title?: string;
    description?: string;
    imageUrl?: string;
    status: string;
    crawlType: string;
    createdAt: Date;
  } {
    return {
      id: entity.id,
      url: entity.url,
      title: entity.title,
      description: entity.description,
      imageUrl: entity.imageUrl,
      status: entity.status,
      crawlType: entity.crawlType,
      createdAt: entity.createAt || new Date(),
    };
  }

  /**
   * Convert CrawlEntity to export format
   */
  toExportFormat(entity: CrawlEntity): {
    id: string;
    url: string;
    status: string;
    crawlType: string;
    title?: string;
    description?: string;
    imageUrl?: string;
    siteName?: string;
    contentType?: string;
    crawlDuration?: number;
    retryCount: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: entity.id,
      url: entity.url,
      status: entity.status,
      crawlType: entity.crawlType,
      title: entity.title,
      description: entity.description,
      imageUrl: entity.imageUrl,
      siteName: entity.siteName,
      contentType: entity.contentType,
      crawlDuration: entity.crawlDuration,
      retryCount: entity.retryCount,
      isActive: entity.isActive,
      createdAt: entity.createAt || new Date(),
      updatedAt: entity.updateAt || new Date(),
    };
  }

  /**
   * Convert CrawlEntity to bookmark format (for integration with bookmark module)
   */
  toBookmarkFormat(entity: CrawlEntity): {
    url: string;
    title?: string;
    description?: string;
    imageUrl?: string;
    siteName?: string;
    metadata?: Record<string, any>;
  } {
    return {
      url: entity.url,
      title: entity.title,
      description: entity.description,
      imageUrl: entity.imageUrl,
      siteName: entity.siteName,
      metadata: entity.metadata,
    };
  }

  /**
   * Convert CrawlEntity to analytics format
   */
  toAnalyticsFormat(entity: CrawlEntity): {
    id: string;
    url: string;
    domain: string;
    status: string;
    crawlType: string;
    crawlDuration?: number;
    contentLength?: number;
    retryCount: number;
    createdAt: Date;
    completedAt?: Date;
  } {
    let domain = 'unknown';
    try {
      domain = new URL(entity.url).hostname;
    } catch {
      // Keep default
    }

    return {
      id: entity.id,
      url: entity.url,
      domain,
      status: entity.status,
      crawlType: entity.crawlType,
      crawlDuration: entity.crawlDuration,
      contentLength: entity.contentLength,
      retryCount: entity.retryCount,
      createdAt: entity.createAt || new Date(),
      completedAt: entity.lastCrawledAt,
    };
  }

  /**
   * Convert CrawlEntity to minimal format for dropdown/select options
   */
  toSelectOption(entity: CrawlEntity): {
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
  } {
    return {
      value: entity.id,
      label: entity.title || entity.url,
      description: entity.description,
      disabled: !entity.isActive || entity.status === CrawlStatus.FAILED,
    };
  }

  /**
   * Convert CrawlEntity to status summary
   */
  toStatusSummary(entity: CrawlEntity): {
    id: string;
    status: string;
    progress: number;
    message?: string;
    estimatedCompletion?: Date;
  } {
    let progress = 0;
    let message: string | undefined;
    let estimatedCompletion: Date | undefined;

    switch (entity.status) {
      case CrawlStatus.PENDING:
        progress = 0;
        message = 'Waiting to be processed';
        break;
      case CrawlStatus.PROCESSING:
        progress = 50;
        message = 'Currently crawling...';
        if (entity.lastCrawledAt) {
          estimatedCompletion = new Date(
            entity.lastCrawledAt.getTime() + 30000,
          ); // 30s estimate
        }
        break;
      case CrawlStatus.COMPLETED:
        progress = 100;
        message = 'Successfully completed';
        break;
      case CrawlStatus.FAILED:
        progress = 0;
        message = entity.errorMessage || 'Crawl failed';
        break;
      case CrawlStatus.TIMEOUT:
        progress = 0;
        message = 'Request timed out';
        break;
    }

    return {
      id: entity.id,
      status: entity.status,
      progress,
      message,
      estimatedCompletion,
    };
  }
}
