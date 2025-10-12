import { FEATURE_KEY } from '@app/constants';
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BookmarkMapper } from './bookmark.mapper';
import { BookmarkService } from './bookmark.service';

@ApiTags(FEATURE_KEY.BOOKMARK)
@Controller(FEATURE_KEY.BOOKMARK)
export class BookmarkController {
  constructor(
    private readonly _bookmarkService: BookmarkService,
    private readonly _bookmarkMapper: BookmarkMapper,
  ) {}

  // @Post()
  // @ApiAuth({
  //   type: BookmarkResponseDto,
  //   summary: 'Create a new bookmark',
  // })
  // async createBookmark(
  //   @Body() createDto: BookmarkCreateDto,
  // ): Promise<BookmarkResponseDto> {
  //   const bookmark = await this._bookmarkService.createBookmark({
  //     url: createDto.url,
  //     title: createDto.title,
  //     description: createDto.description,
  //     imageUrl: createDto.imageUrl,
  //     siteName: createDto.siteName,
  //     tags: createDto.tags,
  //     notes: createDto.notes,
  //     collectionId: createDto.collectionId,
  //   });

  //   return this._bookmarkMapper.toResponseDto(bookmark);
  // }

  // @Get()
  // @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  // @ApiQuery({
  //   name: 'collectionId',
  //   required: false,
  //   description: 'Filter by collection ID',
  // })
  // @ApiQuery({
  //   name: 'isFavorite',
  //   required: false,
  //   description: 'Filter by favorite status',
  // })
  // @ApiQuery({
  //   name: 'tags',
  //   required: false,
  //   description: 'Filter by tags (comma-separated)',
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
  //   type: BookmarkResponseDto,
  //   responseType: 'pagination',
  //   summary: 'Get bookmarks for current user',
  // })
  // async findAll(
  //   @Query() searchDto: BookmarkSearchDto,
  // ): Promise<BookmarkWithPaginationResponseDto> {
  //   const { bookmarks, total } =
  //     await this._bookmarkService.findBookmarks(searchDto);

  //   return this._bookmarkMapper.toPaginationResponseDto(
  //     bookmarks,
  //     total,
  //     searchDto.offset || 0,
  //     searchDto.limit || 20,
  //   );
  // }

  // @Get('stats')
  // @ApiAuth({
  //   type: BookmarkStatsDto,
  //   summary: 'Get bookmark statistics for current user',
  // })
  // async getStats(@CurrentUser() user: UserEntity): Promise<BookmarkStatsDto> {
  //   const stats = await this._bookmarkService.getBookmarkStats(user.id);
  //   return this._bookmarkMapper.toStatsDto(stats);
  // }

  // @Get('recent')
  // @ApiQuery({
  //   name: 'limit',
  //   required: false,
  //   description: 'Number of recent bookmarks',
  // })
  // @ApiAuth({
  //   type: BookmarkResponseDto,
  //   responseType: 'list',
  //   summary: 'Get recent bookmarks for current user',
  // })
  // async getRecentBookmarks(
  //   @Query('limit') limit?: number,
  // ): Promise<BookmarkResponseDto[]> {
  //   const bookmarks = await this._bookmarkService.getRecentBookmarks(
  //     limit || 10,
  //   );

  //   return this._bookmarkMapper.toResponseDtoArray(bookmarks);
  // }

  // @Get('favorites')
  // @ApiAuth({
  //   type: BookmarkResponseDto,
  //   responseType: 'list',
  //   summary: 'Get favorite bookmarks for current user',
  // })
  // async getFavoriteBookmarks(): Promise<BookmarkResponseDto[]> {
  //   const bookmarks = await this._bookmarkService.getFavoriteBookmarks();
  //   return this._bookmarkMapper.toResponseDtoArray(bookmarks);
  // }

  // @Get('most-visited')
  // @ApiQuery({
  //   name: 'limit',
  //   required: false,
  //   description: 'Number of most visited bookmarks',
  // })
  // @ApiAuth({
  //   type: BookmarkResponseDto,
  //   responseType: 'list',
  //   summary: 'Get most visited bookmarks for current user',
  // })
  // async getMostVisitedBookmarks(
  //   @Query('limit') limit?: number,
  // ): Promise<BookmarkResponseDto[]> {
  //   const bookmarks = await this._bookmarkService.getMostVisitedBookmarks(
  //     limit || 10,
  //   );

  //   return this._bookmarkMapper.toResponseDtoArray(bookmarks);
  // }

  // @Get('tags')
  // @ApiOperation({ summary: 'Get all tags for current user' })
  // @ApiResponse({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       tags: {
  //         type: 'array',
  //         items: { type: 'string' },
  //       },
  //     },
  //   },
  // })
  // async getUserTags(): Promise<{ tags: string[] }> {
  //   const tags = await this._bookmarkService.getUserTags();
  //   return { tags };
  // }

  // @Get('search')
  // @ApiQuery({ name: 'q', required: true, description: 'Search term' })
  // @ApiQuery({
  //   name: 'limit',
  //   required: false,
  //   description: 'Number of results',
  // })
  // @ApiAuth({
  //   type: BookmarkResponseDto,
  //   responseType: 'list',
  //   summary: 'Search bookmarks by term',
  // })
  // async searchBookmarks(
  //   @Query('q') searchTerm: string,
  //   @Query('limit') limit?: number,
  // ): Promise<BookmarkResponseDto[]> {
  //   const bookmarks = await this._bookmarkService.searchBookmarks(
  //     searchTerm,
  //     limit || 20,
  //   );

  //   return this._bookmarkMapper.toResponseDtoArray(bookmarks);
  // }

  // @Get('by-tags')
  // @ApiQuery({
  //   name: 'tags',
  //   required: true,
  //   description: 'Tags (comma-separated)',
  // })
  // @ApiQuery({
  //   name: 'limit',
  //   required: false,
  //   description: 'Number of results',
  // })
  // @ApiAuth({
  //   type: BookmarkResponseDto,
  //   responseType: 'list',
  //   summary: 'Find bookmarks by tags',
  // })
  // async findBookmarksByTags(
  //   @Query('tags') tagsParam: string,
  //   @Query('limit') limit?: number,
  // ): Promise<BookmarkResponseDto[]> {
  //   const tags = tagsParam.split(',').map((tag) => tag.trim());
  //   const bookmarks = await this._bookmarkService.findBookmarksByTags(
  //     tags,
  //     limit || 20,
  //   );

  //   return this._bookmarkMapper.toResponseDtoArray(bookmarks);
  // }

  // @Get('collection/:collectionId')
  // @ApiAuth({
  //   type: BookmarkResponseDto,
  //   responseType: 'list',
  //   summary: 'Get bookmarks by collection',
  // })
  // async getBookmarksByCollection(
  //   @Param('collectionId') collectionId: string,
  // ): Promise<BookmarkResponseDto[]> {
  //   const bookmarks =
  //     await this._bookmarkService.getBookmarksByCollection(collectionId);

  //   return this._bookmarkMapper.toResponseDtoArray(bookmarks);
  // }

  // @Get(':id')
  // @ApiAuth({
  //   type: BookmarkResponseDto,
  //   summary: 'Get bookmark by ID',
  // })
  // async findOne(@Param('id') id: string): Promise<BookmarkResponseDto> {
  //   const bookmark = await this._bookmarkService.findOneByIdOrFail(id);
  //   return this._bookmarkMapper.toResponseDto(bookmark);
  // }

  // @Put(':id')
  // @ApiOperation({ summary: 'Update bookmark' })
  // @ApiResponse({ type: BookmarkResponseDto })
  // @ApiAuth({
  //   type: BookmarkResponseDto,
  //   summary: 'Update bookmark',
  // })
  // async updateBookmark(
  //   @Param('id') id: string,
  //   @Body() updateDto: BookmarkUpdateDto,
  // ): Promise<BookmarkResponseDto> {
  //   const bookmark = await this._bookmarkService.updateBookmark(id, {
  //     title: updateDto.title,
  //     description: updateDto.description,
  //     imageUrl: updateDto.imageUrl,
  //     siteName: updateDto.siteName,
  //     tags: updateDto.tags,
  //     notes: updateDto.notes,
  //     collectionId: updateDto.collectionId,
  //     isFavorite: updateDto.isFavorite,
  //   });

  //   return this._bookmarkMapper.toResponseDto(bookmark);
  // }

  // @Post(':id/visit')
  // @ApiAuth({
  //   type: BookmarkResponseDto,
  //   summary: 'Visit bookmark (increment visit count)',
  // })
  // async visitBookmark(@Param('id') id: string): Promise<BookmarkResponseDto> {
  //   const bookmark = await this._bookmarkService.visitBookmark(id);
  //   return this._bookmarkMapper.toResponseDto(bookmark);
  // }

  // @Post(':id/toggle-favorite')
  // @ApiAuth({
  //   type: BookmarkResponseDto,
  //   summary: 'Toggle bookmark favorite status',
  // })
  // async toggleFavorite(@Param('id') id: string): Promise<BookmarkResponseDto> {
  //   const bookmark = await this._bookmarkService.toggleFavorite(id);
  //   return this._bookmarkMapper.toResponseDto(bookmark);
  // }

  // @Delete(':id')
  // @ApiOperation({ summary: 'Delete bookmark' })
  // @ApiResponse({
  //   schema: { type: 'object', properties: { success: { type: 'boolean' } } },
  // })
  // async deleteBookmark(@Param('id') id: string): Promise<{ success: boolean }> {
  //   await this._bookmarkService.deleteBookmark(id);
  //   return { success: true };
  // }

  // @Post('bulk/move')
  // @ApiAuth({
  //   type: BulkBookmarkOperationResponseDto,
  //   summary: 'Bulk move bookmarks to collection',
  // })
  // async bulkMoveBookmarks(
  //   @Body() bulkMoveDto: BulkMoveBookmarksDto,
  // ): Promise<BulkBookmarkOperationResponseDto> {
  //   return this._bookmarkService.bulkMoveBookmarks(bulkMoveDto);
  // }

  // @Post('bulk/favorite')
  // @ApiAuth({
  //   type: BulkBookmarkOperationResponseDto,
  //   summary: 'Bulk update bookmark favorite status',
  // })
  // async bulkUpdateFavorites(
  //   @Body() bulkFavoriteDto: BulkFavoriteBookmarksDto,
  // ): Promise<BulkBookmarkOperationResponseDto> {
  //   return this._bookmarkService.bulkUpdateFavorites(bulkFavoriteDto);
  // }

  // @Post('bulk/delete')
  // @ApiAuth({
  //   type: BulkBookmarkOperationResponseDto,
  //   summary: 'Bulk delete bookmarks',
  // })
  // async bulkDeleteBookmarks(
  //   @Body() bulkDeleteDto: BulkBookmarkOperationDto,
  // ): Promise<BulkBookmarkOperationResponseDto> {
  //   return this._bookmarkService.bulkDeleteBookmarks(bulkDeleteDto.bookmarkIds);
  // }
}
