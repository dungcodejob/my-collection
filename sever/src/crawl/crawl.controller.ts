import { FEATURE_KEY } from '@app/constants';
import { ApiAuth, CurrentUser } from '@app/decorators';
import { UserEntity } from '@app/entities';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CrawlMapper } from './crawl.mapper';
import { CrawlService } from './crawl.service';
import {
  BatchCrawlRequestDto,
  BatchCrawlResponseDto,
  CrawlRequestDto,
  CrawlResponseDto,
  CrawlSearchDto,
  CrawlStatsDto,
  CrawlSummaryDto,
  CrawlWithPaginationResponseDto,
  UrlValidationDto,
  UrlValidationResponseDto,
} from './models';

@ApiTags(FEATURE_KEY.CRAWL)
@Controller(FEATURE_KEY.CRAWL)
export class CrawlController {
  constructor(
    private readonly _crawlService: CrawlService,
    private readonly _crawlMapper: CrawlMapper,
  ) {}

  @Post()
  @ApiAuth({
    type: CrawlResponseDto,
    summary: 'Create a new crawl request with immediate metadata extraction',
    description:
      'Creates a crawl request and returns metadata synchronously in the response',
  })
  async createCrawl(
    @Body() createDto: CrawlRequestDto,
    @CurrentUser() user: UserEntity,
  ): Promise<CrawlResponseDto> {
    const crawl = await this._crawlService.createCrawl(
      {
        url: createDto.url,
        crawlType: createDto.crawlType,
        expiresAt: createDto.expiresAt,
      },
      user.id,
    );

    return this._crawlMapper.toResponseDto(crawl);
  }

  @Post('async')
  @ApiAuth({
    type: CrawlResponseDto,
    summary: 'Create a new crawl request (async processing)',
    description:
      'Creates a crawl request and processes metadata in the background',
  })
  async createCrawlAsync(
    @Body() createDto: CrawlRequestDto,
    @CurrentUser() user: UserEntity,
  ): Promise<CrawlResponseDto> {
    const crawl = await this._crawlService.createCrawlAsync(
      {
        url: createDto.url,
        crawlType: createDto.crawlType,
        expiresAt: createDto.expiresAt,
      },
      user.id,
    );

    return this._crawlMapper.toResponseDto(crawl);
  }

  @Post('batch')
  @ApiOperation({
    summary:
      'Create multiple crawl requests with immediate metadata extraction',
    description:
      'Creates multiple crawl requests and returns metadata synchronously for all URLs',
  })
  @ApiResponse({ type: BatchCrawlResponseDto, status: 201 })
  async createBatchCrawls(
    @Body() batchDto: BatchCrawlRequestDto,
    @CurrentUser() user: UserEntity,
  ): Promise<BatchCrawlResponseDto> {
    const result = await this._crawlService.createBatchCrawls(
      batchDto.urls,
      batchDto.crawlType,
      user.id,
      batchDto.expiresAt,
    );

    return {
      crawls: result.crawls.map((crawl) =>
        this._crawlMapper.toResponseDto(crawl),
      ),
      totalProcessed: result.totalProcessed,
      successCount: result.successCount,
      failureCount: result.failureCount,
      failures: result.failures,
    };
  }

  @Post('batch/async')
  @ApiOperation({
    summary: 'Create multiple crawl requests (async processing)',
    description:
      'Creates multiple crawl requests and processes metadata in the background',
  })
  @ApiResponse({ type: BatchCrawlResponseDto, status: 201 })
  async createBatchCrawlsAsync(
    @Body() batchDto: BatchCrawlRequestDto,
    @CurrentUser() user: UserEntity,
  ): Promise<BatchCrawlResponseDto> {
    const result = await this._crawlService.createBatchCrawlsAsync(
      batchDto.urls,
      batchDto.crawlType,
      user.id,
      batchDto.expiresAt,
    );

    return {
      crawls: result.crawls.map((crawl) =>
        this._crawlMapper.toResponseDto(crawl),
      ),
      totalProcessed: result.totalProcessed,
      successCount: result.successCount,
      failureCount: result.failureCount,
      failures: result.failures,
    };
  }

  @Get()
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status',
  })
  @ApiQuery({
    name: 'crawlType',
    required: false,
    description: 'Filter by crawl type',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Pagination offset',
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Pagination limit' })
  @ApiAuth({
    type: CrawlResponseDto,
    responseType: 'pagination',
    summary: 'Get crawls for current user',
  })
  async findAll(
    @CurrentUser() user: UserEntity,
    @Query() searchDto: CrawlSearchDto,
  ): Promise<CrawlWithPaginationResponseDto> {
    const result = await this._crawlService.findByUserId(user.id, {
      search: searchDto.search,
      status: searchDto.status,
      crawlType: searchDto.crawlType,
      offset: searchDto.offset,
      limit: searchDto.limit,
    });

    return {
      crawls: result.crawls.map((crawl) =>
        this._crawlMapper.toResponseDto(crawl),
      ),
      total: result.total,
      offset: searchDto.offset || 0,
      limit: searchDto.limit || 20,
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get crawl statistics for current user' })
  @ApiResponse({ type: CrawlStatsDto })
  async getStats(@CurrentUser() user: UserEntity): Promise<CrawlStatsDto> {
    return this._crawlService.getCrawlStats(user.id);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent crawls for current user' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of recent crawls',
  })
  @ApiResponse({ type: [CrawlSummaryDto] })
  async getRecentCrawls(
    @CurrentUser() user: UserEntity,
    @Query('limit') limit?: number,
  ): Promise<CrawlSummaryDto[]> {
    const crawls = await this._crawlService.getRecentCrawls(
      user.id,
      limit || 10,
    );

    return crawls.map((crawl) => this._crawlMapper.toSummaryDto(crawl));
  }

  @Post('validate-url')
  @ApiOperation({ summary: 'Validate URL for crawling' })
  @ApiResponse({ type: UrlValidationResponseDto })
  async validateUrl(
    @Body() validationDto: UrlValidationDto,
  ): Promise<UrlValidationResponseDto> {
    const validation = this._crawlService.validateUrl(validationDto.url);

    return {
      url: validationDto.url,
      isValid: validation.isValid,
      errorMessage: validation.errorMessage,
      normalizedUrl: validation.normalizedUrl,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get crawl by ID' })
  @ApiResponse({ type: CrawlResponseDto })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: UserEntity,
  ): Promise<CrawlResponseDto> {
    const crawl = await this._crawlService.findOneByIdOrFail(id, user.id);
    return this._crawlMapper.toResponseDto(crawl);
  }

  @Post(':id/retry')
  @ApiOperation({ summary: 'Retry failed crawl' })
  @ApiResponse({ type: CrawlResponseDto })
  async retryCrawl(
    @Param('id') id: string,
    @CurrentUser() user: UserEntity,
  ): Promise<CrawlResponseDto> {
    const crawl = await this._crawlService.retryCrawl(id, user.id);
    return this._crawlMapper.toResponseDto(crawl);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete crawl' })
  @ApiResponse({
    schema: { type: 'object', properties: { success: { type: 'boolean' } } },
  })
  async deleteCrawl(
    @Param('id') id: string,
    @CurrentUser() user: UserEntity,
  ): Promise<{ success: boolean }> {
    await this._crawlService.deleteCrawl(id, user.id);
    return { success: true };
  }

  @Post('process-pending')
  @ApiOperation({
    summary: 'Process pending crawls (Admin only)',
    description: 'Manually trigger processing of pending crawls',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of crawls to process',
  })
  @ApiResponse({
    schema: { type: 'object', properties: { success: { type: 'boolean' } } },
  })
  async processPendingCrawls(
    @Query('limit') limit?: number,
  ): Promise<{ success: boolean }> {
    await this._crawlService.processPendingCrawls(limit || 10);
    return { success: true };
  }

  @Post('cleanup-expired')
  @ApiOperation({
    summary: 'Cleanup expired crawls (Admin only)',
    description: 'Remove expired crawls from the system',
  })
  @ApiResponse({
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        cleanedCount: { type: 'number' },
      },
    },
  })
  async cleanupExpiredCrawls(): Promise<{
    success: boolean;
    cleanedCount: number;
  }> {
    const cleanedCount = await this._crawlService.cleanupExpiredCrawls();
    return { success: true, cleanedCount };
  }
}
