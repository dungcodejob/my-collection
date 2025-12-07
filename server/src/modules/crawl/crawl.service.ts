import { CrawlStatus, CrawlType } from '@app/entities';
import { UNIT_OF_WORK, type UnitOfWork } from '@app/repositories';
import { RequestContextService } from '@app/request';
import { Inject, Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { MetadataDto } from './models/metadata.dto';
export type CrawlCreateInput = {
  url: string;
  crawlType: CrawlType;
  expiresAt?: Date;
};

export type CrawlSearchOptions = {
  status?: CrawlStatus;
  crawlType?: CrawlType;
  search?: string;
  offset?: number;
  limit?: number;
};

@Injectable()
export class CrawlService {
  private readonly logger = new Logger(CrawlService.name);
  private readonly DEFAULT_TIMEOUT = 30000; // 30 seconds
  private readonly MAX_CONTENT_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly MAX_RETRIES = 3;

  constructor(
    @Inject(UNIT_OF_WORK) private readonly _unitOfWork: UnitOfWork,
    private readonly _ctx: RequestContextService,
  ) {}

  async getMetadata(link: string): Promise<MetadataDto> {
    try {
      const response = await fetch(link, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BookmarkBot/1.0)',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);
      const url = new URL(link);

      // Extract title (priority: og:title > twitter:title > title tag > meta title)
      const title = this.extractTitle($);

      // Extract description (priority: og:description > twitter:description > meta description)
      const description = this.extractDescription($);

      // Extract primary/featured image
      const primaryImage = this.extractPrimaryImage($, url);

      // Extract multiple images (max 10)
      const images = this.extractImages($, url);

      // Extract favicon
      const favicon = this.extractFavicon($, url);

      // Extract site name
      const siteName = this.extractSiteName($);

      // Extract author
      const author = this.extractAuthor($);

      // Extract published date
      const publishedDate = this.extractPublishedDate($);

      const metadata = new MetadataDto();
      metadata.url = link;
      metadata.domain = url.hostname;
      metadata.title = title;
      metadata.description = description;
      metadata.image = primaryImage;
      metadata.images = images;
      metadata.favicon = favicon;
      metadata.siteName = siteName;
      metadata.author = author;
      metadata.publishedDate = publishedDate;

      return metadata;
    } catch (error) {
      this.logger.error(`Failed to fetch metadata for ${link}`, error);
      throw error;
    }
  }

  /**
   * Extract title from HTML (T031)
   */
  private extractTitle($: cheerio.CheerioAPI): string | undefined {
    return (
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('title').text().trim() ||
      $('meta[name="title"]').attr('content') ||
      $('h1').first().text().trim()
    );
  }

  /**
   * Extract description from HTML (T032)
   */
  private extractDescription($: cheerio.CheerioAPI): string | undefined {
    return (
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="twitter:description"]').attr('content') ||
      $('meta[name="description"]').attr('content')
    );
  }

  /**
   * Extract primary/featured image (T033)
   */
  private extractPrimaryImage(
    $: cheerio.CheerioAPI,
    url: URL,
  ): string | undefined {
    const ogImage =
      $('meta[property="og:image"]').attr('content') ||
      $('meta[property="og:image:url"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content');

    if (ogImage) {
      return this.resolveUrl(ogImage, url);
    }

    return undefined;
  }

  /**
   * Extract multiple images from page (T033)
   * Returns up to 10 images
   */
  private extractImages($: cheerio.CheerioAPI, url: URL): string[] {
    const images: string[] = [];
    const seenUrls = new Set<string>();

    // Add og:image first
    const ogImage = this.extractPrimaryImage($, url);
    if (ogImage) {
      images.push(ogImage);
      seenUrls.add(ogImage);
    }

    // Find img tags with reasonable size
    $('img').each((_, elem) => {
      if (images.length >= 10) return false; // Stop at 10 images

      const src = $(elem).attr('src');
      if (!src) return;

      const resolvedUrl = this.resolveUrl(src, url);
      if (!resolvedUrl || seenUrls.has(resolvedUrl)) return;

      // Skip small images (likely icons/buttons)
      const width = $(elem).attr('width');
      const height = $(elem).attr('height');
      if (width && height) {
        const w = parseInt(width);
        const h = parseInt(height);
        if (w < 200 || h < 200) return;
      }

      images.push(resolvedUrl);
      seenUrls.add(resolvedUrl);
    });

    return images.slice(0, 10);
  }

  /**
   * Extract favicon from HTML (T034)
   */
  private extractFavicon($: cheerio.CheerioAPI, url: URL): string | undefined {
    const icon =
      $('link[rel="icon"]').attr('href') ||
      $('link[rel="shortcut icon"]').attr('href') ||
      $('link[rel="apple-touch-icon"]').attr('href');

    if (icon) {
      return this.resolveUrl(icon, url);
    }

    // Default favicon location
    return `${url.origin}/favicon.ico`;
  }

  /**
   * Extract site name
   */
  private extractSiteName($: cheerio.CheerioAPI): string | undefined {
    return (
      $('meta[property="og:site_name"]').attr('content') ||
      $('meta[name="application-name"]').attr('content')
    );
  }

  /**
   * Extract author
   */
  private extractAuthor($: cheerio.CheerioAPI): string | undefined {
    return (
      $('meta[name="author"]').attr('content') ||
      $('meta[property="article:author"]').attr('content') ||
      $('meta[name="twitter:creator"]').attr('content')
    );
  }

  /**
   * Extract published date
   */
  private extractPublishedDate($: cheerio.CheerioAPI): string | undefined {
    const dateStr =
      $('meta[property="article:published_time"]').attr('content') ||
      $('meta[name="publish_date"]').attr('content') ||
      $('meta[name="date"]').attr('content') ||
      $('time[datetime]').attr('datetime');

    if (dateStr) {
      try {
        // Validate and format as ISO 8601
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          return date.toISOString();
        }
      } catch {
        // Invalid date, return undefined
      }
    }

    return undefined;
  }

  /**
   * Resolve relative URLs to absolute URLs
   */
  private resolveUrl(href: string, baseUrl: URL): string | undefined {
    if (!href) return undefined;

    try {
      // Already absolute URL
      if (href.startsWith('http://') || href.startsWith('https://')) {
        return href;
      }

      // Protocol-relative URL
      if (href.startsWith('//')) {
        return `${baseUrl.protocol}${href}`;
      }

      // Absolute path
      if (href.startsWith('/')) {
        return `${baseUrl.origin}${href}`;
      }

      // Relative path
      return new URL(href, baseUrl.href).href;
    } catch {
      return undefined;
    }
  }
  // /*
  //  * Per RFC 3886, URL must begin with a scheme (not limited to http/https), e. g.:
  //  * - www.example.com is not valid URL (missing scheme)
  //  * - javascript:void(0) is valid URL, although not an HTTP one
  //  * - http://.. is valid URL with the host being .. (whether it resolves depends on your DNS)
  //  * - https://example..com is valid URL, same as above
  //  */
  isValidHttpUrl(value: string) {
    let url;

    try {
      url = new URL(value);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      return false;
    }

    return url.protocol === 'http:' || url.protocol === 'https:';
  }

  validURL(str?: string) {
    if (!str) {
      return false;
    }
    const pattern = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$',
      'i',
    ); // fragment locator
    return !!pattern.test(str);
  }

  // /**
  //  * Create a new crawl request with immediate metadata extraction
  //  */
  // async createCrawl(data: CrawlCreateInput): Promise<CrawlEntity> {
  //   // Validate URL
  //   const urlValidation = UrlValidator.validate(data.url);
  //   if (!urlValidation.isValid) {
  //     throw Errors.Crawl.InvalidUrl(urlValidation.errorMessage);
  //   }

  //   const user = this._ctx.user;
  //   const tenant = this._ctx.tenant;

  //   // Check for existing crawl with same URL within tenant
  //   const existingCrawl = await this._unitOfWork.crawl.findByUrl(
  //     urlValidation.normalizedUrl!,
  //     user.id,
  //   );

  //   if (existingCrawl && !existingCrawl.isExpired()) {
  //     // Return existing crawl if not expired
  //     return existingCrawl;
  //   }

  //   // Create new crawl
  //   const crawl = new CrawlEntity({
  //     url: urlValidation.normalizedUrl!,
  //     crawlType: data.crawlType,
  //     user,
  //     tenant,
  //     expiresAt: data.expiresAt,
  //   });

  //   // Perform synchronous crawling to get metadata immediately
  //   await this.processCrawlWithMetadata(crawl);

  //   const createdCrawl = this._unitOfWork.crawl.create(crawl);
  //   await this._unitOfWork.save();

  //   return createdCrawl;
  // }

  // /**
  //  * Create a new crawl request (legacy async version)
  //  */
  // async createCrawlAsync(data: CrawlCreateInput): Promise<CrawlEntity> {
  //   // Validate URL
  //   const urlValidation = UrlValidator.validate(data.url);
  //   if (!urlValidation.isValid) {
  //     throw Errors.Crawl.InvalidUrl(urlValidation.errorMessage);
  //   }

  //   // Get user and tenant entities
  //   const user = this._ctx.user;
  //   const tenant = this._ctx.tenant;

  //   // Check for existing crawl with same URL within tenant
  //   const existingCrawl = await this._unitOfWork.crawl.findByUrl(
  //     urlValidation.normalizedUrl!,
  //     user.id,
  //   );

  //   if (existingCrawl && !existingCrawl.isExpired()) {
  //     // Return existing crawl if not expired
  //     return existingCrawl;
  //   }

  //   // Create new crawl
  //   const crawl = new CrawlEntity({
  //     url: urlValidation.normalizedUrl!,
  //     crawlType: data.crawlType,
  //     user,
  //     tenant,
  //     expiresAt: data.expiresAt,
  //   });

  //   const createdCrawl = this._unitOfWork.crawl.create(crawl);
  //   await this._unitOfWork.save();

  //   // Start crawling process asynchronously
  //   this.processCrawl(createdCrawl.id).catch((error) => {
  //     this.logger.error(`Failed to process crawl ${createdCrawl.id}:`, error);
  //   });

  //   return createdCrawl;
  // }

  // /**
  //  * Create multiple crawl requests
  //  */
  // /**
  //  * Create multiple crawl requests with immediate metadata extraction
  //  */
  // async createBatchCrawls(
  //   urls: string[],
  //   crawlType: CrawlType,
  //   expiresAt?: Date,
  // ): Promise<{
  //   crawls: CrawlEntity[];
  //   totalProcessed: number;
  //   successCount: number;
  //   failureCount: number;
  //   failures: Array<{ url: string; error: string }>;
  // }> {
  //   const results: CrawlEntity[] = [];
  //   const failures: Array<{ url: string; error: string }> = [];
  //   let successCount = 0;

  //   // Get user and tenant entities once for all crawls
  //   const user = this._ctx.user;
  //   const tenant = this._ctx.tenant;

  //   // Process crawls with concurrency limit and Unit of Work pattern
  //   const BATCH_SIZE = 5; // Process 5 URLs concurrently

  //   for (let i = 0; i < urls.length; i += BATCH_SIZE) {
  //     const batch = urls.slice(i, i + BATCH_SIZE);
  //     const batchCrawls: CrawlEntity[] = [];

  //     // Prepare crawl entities for this batch
  //     for (const url of batch) {
  //       try {
  //         // Validate URL
  //         const urlValidation = UrlValidator.validate(url);
  //         if (!urlValidation.isValid) {
  //           failures.push({
  //             url,
  //             error: urlValidation.errorMessage || 'Invalid URL',
  //           });
  //           continue;
  //         }

  //         // Check for existing crawl within tenant
  //         const existingCrawl = await this._unitOfWork.crawl.findByUrl(
  //           urlValidation.normalizedUrl!,
  //           user.id,
  //         );

  //         if (existingCrawl && !existingCrawl.isExpired()) {
  //           results.push(existingCrawl);
  //           successCount++;
  //           continue;
  //         }

  //         // Create new crawl entity
  //         const crawl = new CrawlEntity({
  //           url: urlValidation.normalizedUrl!,
  //           crawlType,
  //           user,
  //           tenant,
  //           expiresAt,
  //         });

  //         batchCrawls.push(crawl);
  //       } catch (error) {
  //         failures.push({
  //           url,
  //           error: error.message || 'Unknown error',
  //         });
  //       }
  //     }

  //     // Process metadata extraction concurrently for this batch
  //     const metadataPromises = batchCrawls.map(async (crawl) => {
  //       try {
  //         await this.processCrawlWithMetadata(crawl);
  //         return { success: true, crawl };
  //       } catch (error) {
  //         return {
  //           success: false,
  //           crawl,
  //           error: error.message || 'Unknown error',
  //         };
  //       }
  //     });

  //     const metadataResults = await Promise.all(metadataPromises);

  //     // Create entities in batch using Unit of Work
  //     const successfulCrawls: CrawlEntity[] = [];
  //     for (const result of metadataResults) {
  //       if (result.success) {
  //         const createdCrawl = this._unitOfWork.crawl.create(result.crawl);
  //         successfulCrawls.push(createdCrawl);
  //         results.push(createdCrawl);
  //         successCount++;
  //       } else {
  //         failures.push({
  //           url: result.crawl.url,
  //           error: result.error,
  //         });
  //       }
  //     }

  //     // Save all entities in this batch with single Unit of Work transaction
  //     if (successfulCrawls.length > 0) {
  //       await this._unitOfWork.save();
  //     }
  //   }

  //   return {
  //     crawls: results,
  //     totalProcessed: urls.length,
  //     successCount,
  //     failureCount: failures.length,
  //     failures,
  //   };
  // }

  // /**
  //  * Create multiple crawl requests (async processing)
  //  */
  // async createBatchCrawlsAsync(
  //   urls: string[],
  //   crawlType: CrawlType,
  //   expiresAt?: Date,
  // ): Promise<{
  //   crawls: CrawlEntity[];
  //   totalProcessed: number;
  //   successCount: number;
  //   failureCount: number;
  //   failures: Array<{ url: string; error: string }>;
  // }> {
  //   const results: CrawlEntity[] = [];
  //   const failures: Array<{ url: string; error: string }> = [];
  //   let successCount = 0;

  //   for (const url of urls) {
  //     try {
  //       const crawl = await this.createCrawlAsync({
  //         url,
  //         crawlType,
  //         expiresAt,
  //       });
  //       results.push(crawl);
  //       successCount++;
  //     } catch (error) {
  //       failures.push({
  //         url,
  //         error: error.message || 'Unknown error',
  //       });
  //     }
  //   }

  //   return {
  //     crawls: results,
  //     totalProcessed: urls.length,
  //     successCount,
  //     failureCount: failures.length,
  //     failures,
  //   };
  // }

  // /**
  //  * Process crawl with metadata extraction and Unit of Work pattern
  //  */
  // private async processCrawlWithMetadata(crawl: CrawlEntity): Promise<void> {
  //   const startTime = Date.now();
  //   crawl.markAsProcessing();

  //   try {
  //     const metadata = await this.crawlUrl(crawl.url, crawl.crawlType);
  //     const duration = Date.now() - startTime;

  //     crawl.markAsCompleted({
  //       title: metadata.title,
  //       description: metadata.description,
  //       imageUrl: metadata.imageUrl,
  //       siteName: metadata.siteName,
  //       contentType: metadata.contentType,
  //       contentLength: metadata.contentLength,
  //       metadata: metadata,
  //       content: metadata.content,
  //       screenshotUrl: metadata.screenshotUrl,
  //       crawlDuration: duration,
  //     });

  //     this.logger.log(`Successfully crawled ${crawl.url} in ${duration}ms`);
  //   } catch (error) {
  //     const duration = Date.now() - startTime;
  //     const errorMessage = error.message || 'Unknown crawl error';

  //     if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
  //       crawl.markAsTimeout();
  //     } else {
  //       crawl.markAsFailed(errorMessage);
  //     }

  //     crawl.crawlDuration = duration;
  //     this.logger.error(
  //       `Failed to crawl ${crawl.url} after ${duration}ms:`,
  //       errorMessage,
  //     );
  //   }
  // }

  // /**
  //  * Process a crawl request
  //  */
  // async processCrawl(crawlId: string): Promise<void> {
  //   const crawl = await this._unitOfWork.crawl.findOneOrFail({ id: crawlId });

  //   if (crawl.status !== CrawlStatus.PENDING) {
  //     return; // Already processed or processing
  //   }

  //   const startTime = Date.now();
  //   crawl.markAsProcessing();
  //   await this._unitOfWork.save();

  //   try {
  //     const metadata = await this.crawlUrl(crawl.url, crawl.crawlType);
  //     const duration = Date.now() - startTime;

  //     crawl.markAsCompleted({
  //       title: metadata.title,
  //       description: metadata.description,
  //       imageUrl: metadata.imageUrl,
  //       siteName: metadata.siteName,
  //       contentType: metadata.contentType,
  //       contentLength: metadata.contentLength,
  //       metadata: metadata,
  //       crawlDuration: duration,
  //     });

  //     await this._unitOfWork.save();
  //     this.logger.log(`Successfully crawled ${crawl.url} in ${duration}ms`);
  //   } catch (error) {
  //     const duration = Date.now() - startTime;
  //     const errorMessage = error.message || 'Unknown crawl error';

  //     if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
  //       crawl.markAsTimeout();
  //     } else {
  //       crawl.markAsFailed(errorMessage);
  //     }

  //     crawl.crawlDuration = duration;
  //     await this._unitOfWork.save();

  //     this.logger.error(
  //       `Failed to crawl ${crawl.url} after ${duration}ms:`,
  //       errorMessage,
  //     );
  //   }
  // }

  // /**
  //  * Crawl URL and extract metadata
  //  */
  // private async crawlUrl(
  //   url: string,
  //   crawlType: CrawlType,
  // ): Promise<ExtractedMetadata> {
  //   const response = await this.fetchUrl(url);
  //   const contentType = response.headers['content-type'] || '';
  //   const contentLength = parseInt(
  //     response.headers['content-length'] || '0',
  //     10,
  //   );

  //   if (!contentType.includes('text/html')) {
  //     // For non-HTML content, return basic metadata
  //     return {
  //       contentType,
  //       contentLength,
  //       title: this.extractTitleFromUrl(url),
  //     };
  //   }

  //   // Extract metadata from HTML
  //   const metadata = MetadataExtractor.extractFromHtml(
  //     response.data,
  //     url,
  //     contentType,
  //     contentLength,
  //   );

  //   // Handle different crawl types
  //   switch (crawlType) {
  //     case CrawlType.METADATA:
  //       // Return only essential metadata
  //       return {
  //         title: metadata.title,
  //         description: metadata.description,
  //         imageUrl: metadata.imageUrl,
  //         siteName: metadata.siteName,
  //         contentType: metadata.contentType,
  //         contentLength: metadata.contentLength,
  //         openGraph: metadata.openGraph,
  //         twitterCard: metadata.twitterCard,
  //       };

  //     case CrawlType.FULL_CONTENT:
  //       // Return full metadata including content
  //       return {
  //         ...metadata,
  //         content: response.data,
  //       };

  //     case CrawlType.SCREENSHOT:
  //       // For screenshot, we would integrate with a screenshot service
  //       // For now, return metadata with placeholder
  //       return {
  //         ...metadata,
  //         screenshotUrl: await this.generateScreenshot(url),
  //       };

  //     default:
  //       return metadata;
  //   }
  // }

  // /**
  //  * Fetch URL content
  //  */
  // private async fetchUrl(url: string): Promise<AxiosResponse> {
  //   try {
  //     const response = await axios.get(url, {
  //       timeout: this.DEFAULT_TIMEOUT,
  //       maxContentLength: this.MAX_CONTENT_SIZE,
  //       maxRedirects: 5,
  //       headers: {
  //         'User-Agent':
  //           'Mozilla/5.0 (compatible; BookmarkCrawler/1.0; +https://example.com/bot)',
  //         Accept:
  //           'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  //         'Accept-Language': 'en-US,en;q=0.5',
  //         'Accept-Encoding': 'gzip, deflate',
  //         Connection: 'keep-alive',
  //         'Upgrade-Insecure-Requests': '1',
  //       },
  //       validateStatus: (status) => status < 400,
  //     });

  //     return response;
  //   } catch (error) {
  //     if (error.response) {
  //       throw new Error(
  //         `HTTP ${error.response.status}: ${error.response.statusText}`,
  //       );
  //     } else if (error.code === 'ECONNABORTED') {
  //       throw new Error('Request timeout');
  //     } else if (error.code === 'ENOTFOUND') {
  //       throw new Error('Domain not found');
  //     } else {
  //       throw new Error(`Network error: ${error.message}`);
  //     }
  //   }
  // }

  // /**
  //  * Generate screenshot (placeholder implementation)
  //  */
  // private async generateScreenshot(url: string): Promise<string | undefined> {
  //   // This would integrate with a screenshot service like Puppeteer
  //   // For now, return undefined
  //   this.logger.log(`Screenshot requested for ${url}`);
  //   return undefined;
  // }

  // /**
  //  * Extract title from URL as fallback
  //  */
  // private extractTitleFromUrl(url: string): string {
  //   try {
  //     const parsedUrl = new URL(url);
  //     const pathname = parsedUrl.pathname;
  //     const segments = pathname.split('/').filter(Boolean);

  //     if (segments.length > 0) {
  //       return segments[segments.length - 1]
  //         .replace(/[-_]/g, ' ')
  //         .replace(/\.[^.]*$/, '') // Remove file extension
  //         .replace(/\b\w/g, (l) => l.toUpperCase()); // Capitalize words
  //     }

  //     return parsedUrl.hostname;
  //   } catch {
  //     return 'Unknown';
  //   }
  // }

  // /**
  //  * Find crawl by ID within tenant context
  //  */
  // async findOneById(
  //   id: string,
  //   userId: string,
  //   tenantId: string,
  // ): Promise<CrawlEntity | null> {
  //   return this._unitOfWork.crawl.findOne({
  //     id,
  //     user: { id: userId },
  //     tenant: { id: tenantId },
  //     deleteFlag: false,
  //   });
  // }

  // /**
  //  * Find crawl by ID or fail within tenant context
  //  */
  // async findOneByIdOrFail(
  //   id: string,
  //   userId: string,
  //   tenantId: string,
  // ): Promise<CrawlEntity> {
  //   const crawl = await this.findOneById(id, userId, tenantId);

  //   if (isNil(crawl)) {
  //     throw Errors.Crawl.NotFound;
  //   }

  //   return crawl;
  // }

  // /**
  //  * Find crawls by user with pagination and filters within tenant context
  //  */
  // async findByUserId(
  //   userId: string,

  //   options?: CrawlSearchOptions,
  // ): Promise<{ crawls: CrawlEntity[]; total: number }> {
  //   return this._unitOfWork.crawl.findWithPagination(
  //     userId,
  //     options?.offset || 0,
  //     options?.limit || 20,
  //     {
  //       status: options?.status,
  //       crawlType: options?.crawlType,
  //       search: options?.search,
  //     },
  //   );
  // }

  // /**
  //  * Get crawl statistics for user within tenant context
  //  */
  // async getCrawlStats(userId: string) {
  //   return this._unitOfWork.crawl.getCrawlStats(userId);
  // }

  // /**
  //  * Retry failed crawl
  //  */
  // /**
  //  * Retry failed crawl with immediate metadata extraction
  //  */
  // async retryCrawl(
  //   crawlId: string,
  //   userId: string,
  //   tenantId: string,
  // ): Promise<CrawlEntity> {
  //   const crawl = await this.findOneByIdOrFail(crawlId, userId, tenantId);

  //   if (!crawl.canRetry(this.MAX_RETRIES)) {
  //     throw Errors.Crawl.CannotRetry;
  //   }

  //   // Perform synchronous retry crawling
  //   crawl.retryCount++;
  //   await this.processCrawlWithMetadata(crawl);
  //   await this._unitOfWork.save();
  //   return crawl;
  // }

  // /**
  //  * Retry failed crawl (async processing)
  //  */
  // async retryCrawlAsync(
  //   crawlId: string,
  //   userId: string,
  //   tenantId: string,
  // ): Promise<CrawlEntity> {
  //   const crawl = await this.findOneByIdOrFail(crawlId, userId, tenantId);

  //   if (!crawl.canRetry(this.MAX_RETRIES)) {
  //     throw Errors.Crawl.CannotRetry;
  //   }

  //   crawl.status = CrawlStatus.PENDING;
  //   crawl.retryCount++;
  //   await this._unitOfWork.save();

  //   // Start crawling process asynchronously
  //   this.processCrawl(crawl.id).catch((error) => {
  //     this.logger.error(`Failed to retry crawl ${crawl.id}:`, error);
  //   });

  //   return crawl;
  // }

  // /**
  //  * Delete crawl
  //  */
  // async deleteCrawl(
  //   crawlId: string,
  //   userId: string,
  //   tenantId: string,
  // ): Promise<void> {
  //   const crawl = await this.findOneByIdOrFail(crawlId, userId, tenantId);

  //   crawl.deleteFlag = true;
  //   crawl.deletedAt = new Date();

  //   await this._unitOfWork.save();
  // }

  // /**
  //  * Validate URL
  //  */
  // validateUrl(url: string) {
  //   return UrlValidator.validate(url);
  // }

  // /**
  //  * Process pending crawls (for background job)
  //  */
  // async processPendingCrawls(limit: number = 10): Promise<void> {
  //   const pendingCrawls = await this._unitOfWork.crawl.findPendingCrawls(limit);

  //   const promises = pendingCrawls.map((crawl) =>
  //     this.processCrawl(crawl.id).catch((error) => {
  //       this.logger.error(
  //         `Failed to process pending crawl ${crawl.id}:`,
  //         error,
  //       );
  //     }),
  //   );

  //   await Promise.all(promises);
  // }

  // /**
  //  * Cleanup expired crawls
  //  */
  // async cleanupExpiredCrawls(): Promise<number> {
  //   const expiredCrawls = await this._unitOfWork.crawl.findExpiredCrawls();

  //   if (expiredCrawls.length === 0) {
  //     return 0;
  //   }

  //   const crawlIds = expiredCrawls.map((crawl) => crawl.id);

  //   await this._unitOfWork.crawl.nativeUpdate(
  //     { id: { $in: crawlIds } },
  //     {
  //       deleteFlag: true,
  //       deletedAt: new Date(),
  //     },
  //   );

  //   return expiredCrawls.length;
  // }

  // /**
  //  * Get recent crawls for user
  //  */
  // async getRecentCrawls(limit: number = 10): Promise<CrawlEntity[]> {
  //   const user = this._ctx.user;
  //   return this._unitOfWork.crawl.findRecentCrawls(user.id, limit);
  // }

  // /**
  //  * Save changes to database
  //  */
  // async save(): Promise<void> {
  //   return this._unitOfWork.save();
  // }
}
