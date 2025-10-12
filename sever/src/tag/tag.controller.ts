import { FEATURE_KEY } from '@app/constants';
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TagMapper } from './tag.mapper';
import { TagService } from './tag.service';

@ApiTags(FEATURE_KEY.TAG)
@Controller('tag')
export class TagController {
  constructor(
    private readonly _tagService: TagService,
    private readonly _tagMapper: TagMapper,
  ) {}

  // @Post()
  // @ApiAuth({
  //   type: TagResponseDto,
  //   summary: 'Create a new tag',
  // })
  // async createTag(@Body() createDto: TagCreateDto): Promise<TagResponseDto> {
  //   const tag = await this._tagService.createTag({
  //     name: createDto.name,
  //     description: createDto.description,
  //     color: createDto.color,
  //     category: createDto.category,
  //     isSystem: createDto.isSystem,
  //   });

  //   return this._tagMapper.toResponseDto(tag);
  // }

  // @Get()
  // @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  // @ApiQuery({
  //   name: 'category',
  //   required: false,
  //   description: 'Filter by category',
  // })
  // @ApiQuery({
  //   name: 'isActive',
  //   required: false,
  //   description: 'Filter by active status',
  // })
  // @ApiQuery({
  //   name: 'isSystem',
  //   required: false,
  //   description: 'Filter by system tag status',
  // })
  // @ApiQuery({
  //   name: 'minUsage',
  //   required: false,
  //   description: 'Minimum usage count',
  // })
  // @ApiQuery({
  //   name: 'maxUsage',
  //   required: false,
  //   description: 'Maximum usage count',
  // })
  // @ApiQuery({
  //   name: 'offset',
  //   required: false,
  //   description: 'Pagination offset',
  // })
  // @ApiQuery({ name: 'limit', required: false, description: 'Pagination limit' })
  // @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field' })
  // @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order' })
  // @ApiAuth({
  //   type: TagResponseDto,
  //   responseType: 'pagination',
  //   summary: 'Get tags for current user',
  // })
  // async findAll(
  //   @Query() searchDto: TagSearchDto,
  // ): Promise<TagWithPaginationResponseDto> {
  //   const { tags, total } = await this._tagService.findTags(searchDto);

  //   return this._tagMapper.toPaginationResponseDto(
  //     tags,
  //     total,
  //     searchDto.offset || 0,
  //     searchDto.limit || 20,
  //   );
  // }

  // @Get('stats')
  // @ApiOperation({ summary: 'Get tag statistics for current user' })
  // @ApiResponse({ type: TagStatsDto })
  // async getStats(@CurrentUser() user: UserEntity): Promise<TagStatsDto> {
  //   const stats = await this._tagService.getTagStats(user.id);
  //   return this._tagMapper.toStatsDto(stats);
  // }

  // @Get('usage-stats')
  // @ApiOperation({ summary: 'Get tag usage statistics for current user' })
  // @ApiResponse({ type: TagUsageStatsDto })
  // async getUsageStats(
  //   @CurrentUser() user: UserEntity,
  // ): Promise<TagUsageStatsDto> {
  //   const stats = await this._tagService.getTagUsageStats(user.id);
  //   return this._tagMapper.toUsageStatsDto(stats);
  // }

  // @Get('popular')
  // @ApiOperation({ summary: 'Get popular tags for current user' })
  // @ApiQuery({
  //   name: 'limit',
  //   required: false,
  //   description: 'Number of popular tags',
  // })
  // @ApiResponse({ type: [TagResponseDto] })
  // async getPopularTags(
  //   @CurrentUser() user: UserEntity,
  //   @Query('limit') limit?: number,
  // ): Promise<TagResponseDto[]> {
  //   const tags = await this._tagService.getPopularTags(user.id, limit || 20);

  //   return this._tagMapper.toResponseDtoArray(tags);
  // }

  // @Get('unused')
  // @ApiOperation({ summary: 'Get unused tags for current user' })
  // @ApiResponse({ type: [TagResponseDto] })
  // async getUnusedTags(
  //   @CurrentUser() user: UserEntity,
  // ): Promise<TagResponseDto[]> {
  //   const tags = await this._tagService.getUnusedTags(user.id);
  //   return this._tagMapper.toResponseDtoArray(tags);
  // }

  // @Get('categories')
  // @ApiOperation({ summary: 'Get all categories for current user' })
  // @ApiResponse({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       categories: {
  //         type: 'array',
  //         items: { type: 'string' },
  //       },
  //     },
  //   },
  // })
  // async getCategories(
  //   @CurrentUser() user: UserEntity,
  // ): Promise<{ categories: string[] }> {
  //   const categories = await this._tagService.getCategories(user.id);
  //   return { categories };
  // }

  // @Get('search')
  // @ApiOperation({ summary: 'Search tags by name' })
  // @ApiQuery({ name: 'q', required: true, description: 'Search term' })
  // @ApiQuery({
  //   name: 'limit',
  //   required: false,
  //   description: 'Number of results',
  // })
  // @ApiResponse({ type: [TagResponseDto] })
  // async searchTags(
  //   @CurrentUser() user: UserEntity,
  //   @Query('q') searchTerm: string,
  //   @Query('limit') limit?: number,
  // ): Promise<TagResponseDto[]> {
  //   const tags = await this._tagService.searchTags(
  //     user.id,
  //     searchTerm,
  //     limit || 20,
  //   );

  //   return this._tagMapper.toResponseDtoArray(tags);
  // }

  // @Get('autocomplete')
  // @ApiOperation({ summary: 'Get tag autocomplete suggestions' })
  // @ApiQuery({ name: 'q', required: true, description: 'Search term' })
  // @ApiQuery({
  //   name: 'limit',
  //   required: false,
  //   description: 'Number of suggestions',
  // })
  // @ApiResponse({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       suggestions: {
  //         type: 'array',
  //         items: {
  //           type: 'object',
  //           properties: {
  //             id: { type: 'string' },
  //             name: { type: 'string' },
  //             displayName: { type: 'string' },
  //             color: { type: 'string' },
  //             usageCount: { type: 'number' },
  //           },
  //         },
  //       },
  //     },
  //   },
  // })
  // async getAutocompleteSuggestions(
  //   @CurrentUser() user: UserEntity,
  //   @Query('q') searchTerm: string,
  //   @Query('limit') limit?: number,
  // ): Promise<{ suggestions: any[] }> {
  //   const tags = await this._tagService.searchTags(
  //     user.id,
  //     searchTerm,
  //     limit || 10,
  //   );

  //   const suggestions = this._tagMapper.toAutocompleteSuggestions(tags);
  //   return { suggestions };
  // }

  // @Get('category/:category')
  // @ApiOperation({ summary: 'Get tags by category' })
  // @ApiResponse({ type: [TagResponseDto] })
  // async getTagsByCategory(
  //   @Param('category') category: string,
  //   @CurrentUser() user: UserEntity,
  // ): Promise<TagResponseDto[]> {
  //   const tags = await this._tagService.getTagsByCategory(category, user.id);
  //   return this._tagMapper.toResponseDtoArray(tags);
  // }

  // @Get('timeline')
  // @ApiOperation({ summary: 'Get tag usage timeline' })
  // @ApiQuery({
  //   name: 'days',
  //   required: false,
  //   description: 'Number of days to include',
  // })
  // @ApiResponse({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       timeline: {
  //         type: 'array',
  //         items: {
  //           type: 'object',
  //           properties: {
  //             date: { type: 'string' },
  //             count: { type: 'number' },
  //           },
  //         },
  //       },
  //     },
  //   },
  // })
  // async getTagTimeline(
  //   @CurrentUser() user: UserEntity,
  //   @Query('days') days?: number,
  // ): Promise<{ timeline: { date: string; count: number }[] }> {
  //   const timeline = await this._tagService.getTagTimeline(user.id, days || 30);
  //   return { timeline };
  // }

  // @Get(':id')
  // @ApiOperation({ summary: 'Get tag by ID' })
  // @ApiResponse({ type: TagResponseDto })
  // async findOne(
  //   @Param('id') id: string,
  //   @CurrentUser() user: UserEntity,
  // ): Promise<TagResponseDto> {
  //   const tag = await this._tagService.findOneByIdOrFail(id, user.id);
  //   return this._tagMapper.toResponseDto(tag);
  // }

  // @Get(':id/related')
  // @ApiOperation({ summary: 'Get related tags' })
  // @ApiQuery({
  //   name: 'limit',
  //   required: false,
  //   description: 'Number of related tags',
  // })
  // @ApiResponse({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       relatedTags: {
  //         type: 'array',
  //         items: {
  //           type: 'object',
  //           properties: {
  //             tagId: { type: 'string' },
  //             tagName: { type: 'string' },
  //             coOccurrence: { type: 'number' },
  //           },
  //         },
  //       },
  //     },
  //   },
  // })
  // async getRelatedTags(
  //   @Param('id') id: string,
  //   @CurrentUser() user: UserEntity,
  //   @Query('limit') limit?: number,
  // ): Promise<{ relatedTags: any[] }> {
  //   const relatedTags = await this._tagService.getRelatedTags(
  //     id,
  //     user.id,
  //     limit || 10,
  //   );
  //   return { relatedTags };
  // }

  // @Get(':name/similar')
  // @ApiOperation({ summary: 'Get similar tags by name' })
  // @ApiQuery({
  //   name: 'limit',
  //   required: false,
  //   description: 'Number of similar tags',
  // })
  // @ApiResponse({ type: [TagResponseDto] })
  // async getSimilarTags(
  //   @Param('name') name: string,
  //   @CurrentUser() user: UserEntity,
  //   @Query('limit') limit?: number,
  // ): Promise<TagResponseDto[]> {
  //   const tags = await this._tagService.getSimilarTags(
  //     name,
  //     user.id,
  //     limit || 5,
  //   );
  //   return this._tagMapper.toResponseDtoArray(tags);
  // }

  // @Put(':id')
  // @ApiOperation({ summary: 'Update tag' })
  // @ApiResponse({ type: TagResponseDto })
  // async updateTag(
  //   @Param('id') id: string,
  //   @Body() updateDto: TagUpdateDto,
  //   @CurrentUser() user: UserEntity,
  // ): Promise<TagResponseDto> {
  //   const tag = await this._tagService.updateTag(
  //     id,
  //     {
  //       name: updateDto.name,
  //       description: updateDto.description,
  //       color: updateDto.color,
  //       category: updateDto.category,
  //       isActive: updateDto.isActive,
  //     },
  //     user.id,
  //   );

  //   return this._tagMapper.toResponseDto(tag);
  // }

  // @Delete(':id')
  // @ApiOperation({ summary: 'Delete tag' })
  // @ApiResponse({
  //   schema: { type: 'object', properties: { success: { type: 'boolean' } } },
  // })
  // async deleteTag(
  //   @Param('id') id: string,
  //   @CurrentUser() user: UserEntity,
  // ): Promise<{ success: boolean }> {
  //   await this._tagService.deleteTag(id, user.id);
  //   return { success: true };
  // }

  // @Post('bulk/update')
  // @ApiOperation({ summary: 'Bulk update tags' })
  // @ApiResponse({ type: BulkTagOperationResponseDto })
  // async bulkUpdateTags(
  //   @Body() bulkUpdateDto: BulkTagUpdateDto,
  //   @CurrentUser() user: UserEntity,
  // ): Promise<BulkTagOperationResponseDto> {
  //   return this._tagService.bulkUpdateTags(bulkUpdateDto, user.id);
  // }

  // @Post('bulk/delete')
  // @ApiOperation({ summary: 'Bulk delete tags' })
  // @ApiResponse({ type: BulkTagOperationResponseDto })
  // async bulkDeleteTags(
  //   @Body() bulkDeleteDto: BulkTagOperationDto,
  //   @CurrentUser() user: UserEntity,
  // ): Promise<BulkTagOperationResponseDto> {
  //   return this._tagService.bulkDeleteTags(bulkDeleteDto, user.id);
  // }

  // @Post('bulk/assign')
  // @ApiOperation({ summary: 'Bulk assign tags to bookmarks' })
  // @ApiResponse({ type: BulkTagOperationResponseDto })
  // async bulkAssignTags(
  //   @Body() bulkAssignDto: BulkTagAssignDto,
  //   @CurrentUser() user: UserEntity,
  // ): Promise<BulkTagOperationResponseDto> {
  //   return this._tagService.bulkAssignTags(bulkAssignDto, user.id);
  // }

  // @Post('cleanup')
  // @ApiOperation({ summary: 'Clean up unused tags' })
  // @ApiResponse({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       deletedCount: { type: 'number' },
  //       message: { type: 'string' },
  //     },
  //   },
  // })
  // async cleanupUnusedTags(
  //   @CurrentUser() user: UserEntity,
  // ): Promise<{ deletedCount: number; message: string }> {
  //   const deletedCount = await this._tagService.cleanupUnusedTags(user.id);
  //   return {
  //     deletedCount,
  //     message: `Successfully cleaned up ${deletedCount} unused tags`,
  //   };
  // }

  // @Post(':tagId/assign/:bookmarkId')
  // @ApiOperation({ summary: 'Assign tag to bookmark' })
  // @ApiResponse({
  //   schema: { type: 'object', properties: { success: { type: 'boolean' } } },
  // })
  // async assignTagToBookmark(
  //   @Param('tagId') tagId: string,
  //   @Param('bookmarkId') bookmarkId: string,
  // ): Promise<{ success: boolean }> {
  //   await this._tagService.assignTagToBookmark(bookmarkId, tagId);
  //   return { success: true };
  // }

  // @Delete(':tagId/remove/:bookmarkId')
  // @ApiOperation({ summary: 'Remove tag from bookmark' })
  // @ApiResponse({
  //   schema: { type: 'object', properties: { success: { type: 'boolean' } } },
  // })
  // async removeTagFromBookmark(
  //   @Param('tagId') tagId: string,
  //   @Param('bookmarkId') bookmarkId: string,
  //   @CurrentUser() user: UserEntity,
  // ): Promise<{ success: boolean }> {
  //   await this._tagService.removeTagFromBookmark(bookmarkId, tagId, user.id);
  //   return { success: true };
  // }
}
