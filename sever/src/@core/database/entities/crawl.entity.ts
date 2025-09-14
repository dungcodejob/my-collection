import { CrawlRepository } from '@app/repositories';
import {
  Entity,
  EntityRepositoryType,
  Enum,
  Index,
  ManyToOne,
  Property,
} from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { UserEntity } from './user.entity';

export enum CrawlStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  TIMEOUT = 'TIMEOUT',
}

export enum CrawlType {
  METADATA = 'METADATA',
  FULL_CONTENT = 'FULL_CONTENT',
  SCREENSHOT = 'SCREENSHOT',
}

@Entity({ repository: () => CrawlRepository })
@Index({ properties: ['id'] })
@Index({ properties: ['user', 'deleteFlag'] })
@Index({ properties: ['url'] })
@Index({ properties: ['status'] })
@Index({ properties: ['crawlType'] })
export class CrawlEntity extends BaseEntity {
  @Property({ length: 2048 })
  url: string;

  @Enum(() => CrawlStatus)
  status: CrawlStatus = CrawlStatus.PENDING;

  @Enum(() => CrawlType)
  crawlType: CrawlType = CrawlType.METADATA;

  @Property({ nullable: true, length: 500 })
  title?: string;

  @Property({ nullable: true, length: 1000 })
  description?: string;

  @Property({ nullable: true, length: 2048 })
  imageUrl?: string;

  @Property({ nullable: true, length: 100 })
  siteName?: string;

  @Property({ nullable: true, length: 50 })
  contentType?: string;

  @Property({ nullable: true })
  contentLength?: number;

  @Property({ nullable: true, type: 'json' })
  metadata?: Record<string, any>;

  @Property({ nullable: true, type: 'text' })
  content?: string;

  @Property({ nullable: true, length: 2048 })
  screenshotUrl?: string;

  @Property({ nullable: true })
  crawlDuration?: number; // in milliseconds

  @Property({ nullable: true, length: 1000 })
  errorMessage?: string;

  @Property({ nullable: true })
  retryCount: number = 0;

  @Property({ nullable: true })
  lastCrawledAt?: Date;

  @Property({ nullable: true })
  expiresAt?: Date;

  @Property({ default: true })
  isActive: boolean = true;

  @ManyToOne(() => UserEntity)
  user: UserEntity;

  [EntityRepositoryType]?: CrawlRepository;

  constructor({
    url,
    crawlType,
    user,
    expiresAt,
  }: {
    url: string;
    crawlType: CrawlType;
    user: UserEntity;
    expiresAt?: Date;
  }) {
    super();
    this.url = url;
    this.crawlType = crawlType;
    this.user = user;
    this.expiresAt = expiresAt;
  }

  /**
   * Mark crawl as processing
   */
  markAsProcessing(): void {
    this.status = CrawlStatus.PROCESSING;
    this.lastCrawledAt = new Date();
  }

  /**
   * Mark crawl as completed with metadata
   */
  markAsCompleted(data: {
    title?: string;
    description?: string;
    imageUrl?: string;
    siteName?: string;
    contentType?: string;
    contentLength?: number;
    metadata?: Record<string, any>;
    content?: string;
    screenshotUrl?: string;
    crawlDuration?: number;
  }): void {
    this.status = CrawlStatus.COMPLETED;
    this.title = data.title;
    this.description = data.description;
    this.imageUrl = data.imageUrl;
    this.siteName = data.siteName;
    this.contentType = data.contentType;
    this.contentLength = data.contentLength;
    this.metadata = data.metadata;
    this.content = data.content;
    this.screenshotUrl = data.screenshotUrl;
    this.crawlDuration = data.crawlDuration;
    this.lastCrawledAt = new Date();
  }

  /**
   * Mark crawl as failed
   */
  markAsFailed(errorMessage: string): void {
    this.status = CrawlStatus.FAILED;
    this.errorMessage = errorMessage;
    this.retryCount += 1;
    this.lastCrawledAt = new Date();
  }

  /**
   * Mark crawl as timeout
   */
  markAsTimeout(): void {
    this.status = CrawlStatus.TIMEOUT;
    this.retryCount += 1;
    this.lastCrawledAt = new Date();
  }

  /**
   * Check if crawl can be retried
   */
  canRetry(maxRetries: number = 3): boolean {
    return (
      this.retryCount < maxRetries &&
      (this.status === CrawlStatus.FAILED ||
        this.status === CrawlStatus.TIMEOUT)
    );
  }

  /**
   * Check if crawl is expired
   */
  isExpired(): boolean {
    return this.expiresAt ? new Date() > this.expiresAt : false;
  }

  /**
   * Check if crawl is successful
   */
  isSuccessful(): boolean {
    return this.status === CrawlStatus.COMPLETED;
  }

  /**
   * Check if crawl is in progress
   */
  isInProgress(): boolean {
    return this.status === CrawlStatus.PROCESSING;
  }

  /**
   * Get crawl result summary
   */
  getSummary(): {
    id: string;
    url: string;
    status: CrawlStatus;
    title?: string;
    description?: string;
    imageUrl?: string;
    crawlDuration?: number;
  } {
    return {
      id: this.id,
      url: this.url,
      status: this.status,
      title: this.title,
      description: this.description,
      imageUrl: this.imageUrl,
      crawlDuration: this.crawlDuration,
    };
  }
}
