import { FEATURE_KEY } from '@app/constants';
import { ApiAuth } from '@app/decorators';
import { ResponseBuilder, SingleResponseDto } from '@app/models';
import { FileUploadService } from '@app/services';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  ImageUploadRequestDto,
  ImageUploadResponseDto,
  ImageUrlValidationRequestDto,
  ImageUrlValidationResponseDto,
} from './models';

@ApiTags(FEATURE_KEY.UPLOAD_FILE)
@Controller(FEATURE_KEY.UPLOAD_FILE)
export class UploadFileController {
  constructor(private readonly _fileUploadService: FileUploadService) {}

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

  /**
   * T111: Create POST /bookmarks/images/presigned-url endpoint
   * Generate presigned URL for direct image upload to cloud storage
   */
  @Post('images/presigned-url')
  @ApiAuth({
    type: ImageUploadResponseDto,
    summary: 'Get presigned URL for image upload',
    description: 'Generates a presigned URL for direct upload to cloud storage',
  })
  async getPresignedUrl(
    @Body() requestDto: ImageUploadRequestDto,
  ): Promise<Partial<SingleResponseDto<ImageUploadResponseDto>>> {
    const result = await this._fileUploadService.generatePresignedUrl(
      requestDto.filename,
      requestDto.mimeType,
      requestDto.size,
    );

    return ResponseBuilder.toSingle({ data: result });
  }

  /**
   * T116: Create POST /bookmarks/images/validate endpoint
   * Validate custom image URL
   */
  @Post('images/validate')
  @ApiAuth({
    type: ImageUrlValidationResponseDto,
    summary: 'Validate custom image URL',
    description:
      'Validates that a provided image URL is accessible and is a valid image',
  })
  async validateImageUrl(
    @Body() requestDto: ImageUrlValidationRequestDto,
  ): Promise<Partial<SingleResponseDto<ImageUrlValidationResponseDto>>> {
    const result = await this._fileUploadService.validateImageUrl(
      requestDto.imageUrl,
    );

    return ResponseBuilder.toSingle({ data: result });
  }
}
