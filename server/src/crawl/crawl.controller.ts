import { FEATURE_KEY } from '@app/constants';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CrawlMapper } from './crawl.mapper';
import { CrawlService } from './crawl.service';
import { MetadataDto } from './models';

@ApiTags(FEATURE_KEY.CRAWL)
@Controller(FEATURE_KEY.CRAWL)
export class CrawlController {
  constructor(
    private readonly _crawlService: CrawlService,
    private readonly _crawlMapper: CrawlMapper,
  ) {}

  @Get('metadata')
  @ApiOperation({
    summary: 'Fetch metadata from URL',
    description:
      'Extracts metadata (title, description, images) from a given URL',
  })
  @ApiQuery({
    name: 'url',
    required: true,
    description: 'URL to fetch metadata from',
    example: 'https://example.com/article',
  })
  @ApiResponse({
    status: 200,
    description: 'Metadata extracted successfully',
    type: MetadataDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid URL or request',
  })
  @ApiResponse({
    status: 408,
    description: 'Request timeout',
  })
  async getMetadata(@Query('url') url: string): Promise<MetadataDto> {
    return this._crawlService.getMetadata(url);
  }

  // @Post()
  // @ApiAuth({
  //   type: CrawlResponseDto,
  //   summary: 'Create a new crawl request with immediate metadata extraction',
  //   description:
  //     'Creates a crawl request and returns metadata synchronously in the response',
  // })
  // async createCrawl(
  //   @Body() createDto: CrawlRequestDto,
  // ): Promise<CrawlResponseDto> {
  //   const crawl = await this._crawlService.createCrawl({
  //     url: createDto.url,
  //     crawlType: createDto.crawlType,
  //     expiresAt: createDto.expiresAt,
  //   });

  //   return this._crawlMapper.toResponseDto(crawl);
  // }

  // @Post('async')
  // @ApiAuth({
  //   type: CrawlResponseDto,
  //   summary: 'Create a new crawl request (async processing)',
  //   description:
  //     'Creates a crawl request and processes metadata in the background',
  // })
  // async createCrawlAsync(
  //   @Body() createDto: CrawlRequestDto,
  // ): Promise<CrawlResponseDto> {
  //   const crawl = await this._crawlService.createCrawlAsync({
  //     url: createDto.url,
  //     crawlType: createDto.crawlType,
  //     expiresAt: createDto.expiresAt,
  //   });

  //   return this._crawlMapper.toResponseDto(crawl);
  // }

  // // @Post('batch')
  // // @ApiOperation({
  // //   summary:
  // //     'Create multiple crawl requests with immediate metadata extraction',
  // //   description:
  // //     'Creates multiple crawl requests and returns metadata synchronously for all URLs',
  // // })
  // // @ApiResponse({ type: BatchCrawlResponseDto, status: 201 })
  // // async createBatchCrawls(
  // //   @Body() batchDto: BatchCrawlRequestDto,
  // // ): Promise<BatchCrawlResponseDto> {
  // //   const crawls = await this._crawlService.createBatchCrawls(
  // //     batchDto.urls,
  // //     batchDto.crawlType,
  // //     batchDto.expiresAt,
  // //   );

  // //   return this._crawlMapper.toResponseDto(crawls);
  // // }

  // // @Post('batch/async')
  // // @ApiOperation({
  // //   summary: 'Create multiple crawl requests (async processing)',
  // //   description:
  // //     'Creates multiple crawl requests and processes metadata in the background',
  // // })
  // // @ApiResponse({ type: BatchCrawlResponseDto, status: 201 })
  // // async createBatchCrawlsAsync(
  // //   @Body() batchDto: BatchCrawlRequestDto,
  // //   @CurrentUser() user: UserEntity,
  // //   @TenantId() tenantId: string,
  // // ): Promise<BatchCrawlResponseDto> {
  // //   const crawls = await this._crawlService.createBatchCrawlsAsync(
  // //     batchDto.urls.map((url) => ({
  // //       url: url.url,
  // //       crawlType: url.crawlType,
  // //       options: url.options,
  // //     })),
  // //     user.id,
  // //     tenantId,
  // //   );

  // //   return this._crawlMapper.toBatchResponseDto(crawls);
  // // }

  // // @Get()
  // // @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  // // @ApiQuery({
  // //   name: 'status',
  // //   required: false,
  // //   description: 'Filter by status',
  // // })
  // // @ApiQuery({
  // //   name: 'crawlType',
  // //   required: false,
  // //   description: 'Filter by crawl type',
  // // })
  // // @ApiQuery({
  // //   name: 'offset',
  // //   required: false,
  // //   description: 'Pagination offset',
  // // })
  // // @ApiQuery({ name: 'limit', required: false, description: 'Pagination limit' })
  // // @ApiAuth({
  // //   type: CrawlResponseDto,
  // //   responseType: 'pagination',
  // //   summary: 'Get crawls for current user',
  // // })
  // // async findAll(
  // //   @Query() searchDto: CrawlSearchDto,
  // // ): Promise<CrawlWithPaginationResponseDto> {
  // //   const { crawls, total } = await this._crawlService.findCrawls(searchDto);

  // //   return this._crawlMapper.toPaginationResponseDto(
  // //     crawls,
  // //     total,
  // //     searchDto.offset || 0,
  // //     searchDto.limit || 20,
  // //   );
  // // }

  // @Get('stats')
  // @ApiOperation({ summary: 'Get crawl statistics for current user' })
  // @ApiResponse({ type: CrawlStatsDto })
  // async getStats(@CurrentUser() user: UserEntity): Promise<CrawlStatsDto> {
  //   return this._crawlService.getCrawlStats(user.id);
  // }

  // @Get('recent')
  // @ApiOperation({ summary: 'Get recent crawls for current user' })
  // @ApiQuery({
  //   name: 'limit',
  //   required: false,
  //   description: 'Number of recent crawls',
  // })
  // @ApiResponse({ type: [CrawlSummaryDto] })
  // async getRecentCrawls(
  //   @Query('limit') limit?: number,
  // ): Promise<CrawlSummaryDto[]> {
  //   const crawls = await this._crawlService.getRecentCrawls(limit || 10);

  //   return this._crawlMapper.toSummaryDtoArray(crawls);
  // }

  // @Post('validate-url')
  // @ApiOperation({ summary: 'Validate URL for crawling' })
  // @ApiResponse({ type: UrlValidationResponseDto })
  // async validateUrl(
  //   @Body() validationDto: UrlValidationDto,
  // ): Promise<UrlValidationResponseDto> {
  //   const validation = this._crawlService.validateUrl(validationDto.url);

  //   return {
  //     isValid: validation.isValid,
  //     reason: validation.reason,
  //     suggestions: validation.suggestions,
  //   };
  // }

  // @Get(':id')
  // @ApiOperation({ summary: 'Get crawl by ID' })
  // @ApiResponse({ type: CrawlResponseDto })
  // async findOne(
  //   @Param('id') id: string,
  //   @CurrentUser() user: UserEntity,
  //   @TenantId() tenantId: string,
  // ): Promise<CrawlResponseDto> {
  //   const crawl = await this._crawlService.findOneByIdOrFail(
  //     id,
  //     user.id,
  //     tenantId,
  //   );
  //   return this._crawlMapper.toResponseDto(crawl);
  // }

  // @Post(':id/retry')
  // @ApiOperation({ summary: 'Retry failed crawl' })
  // @ApiResponse({ type: CrawlResponseDto })
  // async retryCrawl(
  //   @Param('id') id: string,
  //   @CurrentUser() user: UserEntity,
  //   @TenantId() tenantId: string,
  // ): Promise<CrawlResponseDto> {
  //   const crawl = await this._crawlService.retryCrawl(id, user.id, tenantId);
  //   return this._crawlMapper.toResponseDto(crawl);
  // }

  // @Delete(':id')
  // @ApiOperation({ summary: 'Delete crawl' })
  // @ApiResponse({
  //   schema: { type: 'object', properties: { success: { type: 'boolean' } } },
  // })
  // async deleteCrawl(
  //   @Param('id') id: string,
  //   @CurrentUser() user: UserEntity,
  //   @TenantId() tenantId: string,
  // ): Promise<{ success: boolean }> {
  //   await this._crawlService.deleteCrawl(id, user.id, tenantId);
  //   return { success: true };
  // }

  // @Post('process-pending')
  // @ApiOperation({
  //   summary: 'Process pending crawls (Admin only)',
  //   description: 'Manually trigger processing of pending crawls',
  // })
  // @ApiQuery({
  //   name: 'limit',
  //   required: false,
  //   description: 'Number of crawls to process',
  // })
  // @ApiResponse({
  //   schema: { type: 'object', properties: { success: { type: 'boolean' } } },
  // })
  // async processPendingCrawls(
  //   @Query('limit') limit?: number,
  // ): Promise<{ success: boolean }> {
  //   await this._crawlService.processPendingCrawls(limit || 10);
  //   return { success: true };
  // }

  // @Post('cleanup-expired')
  // @ApiOperation({
  //   summary: 'Cleanup expired crawls (Admin only)',
  //   description: 'Remove expired crawls from the system',
  // })
  // @ApiResponse({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       success: { type: 'boolean' },
  //       cleanedCount: { type: 'number' },
  //     },
  //   },
  // })
  // async cleanupExpiredCrawls(): Promise<{
  //   success: boolean;
  //   cleanedCount: number;
  // }> {
  //   const cleanedCount = await this._crawlService.cleanupExpiredCrawls();
  //   return { success: true, cleanedCount };
  // }
}
