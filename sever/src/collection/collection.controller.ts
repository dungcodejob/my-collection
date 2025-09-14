import { FEATURE_KEY, SWAGGER_SCHEME } from '@app/constants';
import { ApiAuth, CurrentUser } from '@app/decorators';
import { UserEntity } from '@app/entities';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CollectionMapper } from './collection.mapper';
import { CollectionService } from './collection.service';
import {
  CollectionCreateDto,
  CollectionDto,
  CollectionMoveDto,
  CollectionTreeResponseDto,
  CollectionUpdateDto,
  CollectionWithPaginationResponseDto,
  UpdateSortOrderDto,
} from './models';

@ApiTags(FEATURE_KEY.COLLECTION)
@ApiBearerAuth(SWAGGER_SCHEME.JWT_AUTH)
@Controller(FEATURE_KEY.COLLECTION)
export class CollectionController {
  constructor(
    private readonly _collectionService: CollectionService,
    private readonly _collectionMapper: CollectionMapper,
  ) {}

  @ApiQuery({ name: 'search', required: false, description: 'Search by name' })
  @ApiQuery({
    name: 'parentId',
    required: false,
    description: 'Filter by parent ID',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Pagination offset',
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Pagination limit' })
  @ApiAuth({
    type: CollectionDto,
    responseType: 'list',
    summary: 'Get all collections for current user',
  })
  @Get()
  async findAll(
    @CurrentUser() user: UserEntity,
    @Query('search') search?: string,
    @Query('parentId') parentId?: string,
    @Query('offset') offset?: number,
    @Query('limit') limit?: number,
  ): Promise<CollectionDto[]> {
    const collections = await this._collectionService.findByUserId(user.id, {
      search,
      parentId,
      offset,
      limit,
    });

    return collections.map((collection) =>
      this._collectionMapper.toResponseDto(collection),
    );
  }

  @ApiQuery({
    name: 'maxDepth',
    required: false,
    description: 'Maximum tree depth',
  })
  @ApiAuth({
    type: CollectionTreeResponseDto,
    responseType: 'list',
    summary: 'Get collection tree structure',
  })
  @Get('tree')
  async getTree(
    @CurrentUser() user: UserEntity,
    @Query('maxDepth') maxDepth?: number,
  ): Promise<CollectionTreeResponseDto[]> {
    const collections = await this._collectionService.findCollectionTree(
      user.id,
      maxDepth || 5,
    );

    return collections.map((collection) =>
      this._collectionMapper.toTreeResponseDto(collection),
    );
  }

  @Get('root')
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Pagination offset',
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Pagination limit' })
  @ApiAuth({
    type: CollectionDto,
    responseType: 'list',
    summary: 'Get root collections (collections without parent)',
  })
  async findRootCollections(
    @CurrentUser() user: UserEntity,
    @Query('offset') offset?: number,
    @Query('limit') limit?: number,
  ): Promise<CollectionDto[]> {
    const collections = await this._collectionService.findRootCollections(
      user.id,
      { offset, limit },
    );

    return collections.map((collection) =>
      this._collectionMapper.toResponseDto(collection),
    );
  }

  @Get('paginated')
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Pagination offset',
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Pagination limit' })
  @ApiResponse({ type: CollectionWithPaginationResponseDto })
  @ApiAuth({
    type: CollectionWithPaginationResponseDto,
    summary: 'Get collections with pagination',
  })
  async findWithPagination(
    @CurrentUser() user: UserEntity,
    @Query('offset') offset?: number,
    @Query('limit') limit?: number,
  ): Promise<CollectionWithPaginationResponseDto> {
    const result = await this._collectionService.findWithPagination(user.id, {
      offset,
      limit,
    });

    return {
      collections: result.collections.map((collection) =>
        this._collectionMapper.toResponseDto(collection),
      ),
      total: result.total,
      offset: offset || 0,
      limit: limit || 20,
    };
  }

  @Get('count')
  @ApiOperation({ summary: 'Get total count of collections for current user' })
  @ApiResponse({
    schema: { type: 'object', properties: { count: { type: 'number' } } },
  })
  @ApiAuth({
    type: { count: { type: 'number' } } as any,
    summary: 'Get total count of collections for current user',
  })
  async getCount(@CurrentUser() user: UserEntity): Promise<{ count: number }> {
    const count = await this._collectionService.countByUser(user.id);
    return { count };
  }

  @Get(':id')
  @ApiQuery({
    name: 'includeChildren',
    required: false,
    description: 'Include children in response',
  })
  @ApiAuth({
    type: CollectionDto,
    summary: 'Get collection by ID',
  })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: UserEntity,
    @Query('includeChildren') includeChildren?: boolean,
  ): Promise<CollectionDto> {
    const collection = await this._collectionService.findOneByIdOrFail(
      id,
      user.id,
      { includeChildren },
    );

    return this._collectionMapper.toResponseDto(collection);
  }

  @Get(':id/children')
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Pagination offset',
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Pagination limit' })
  @ApiAuth({
    type: CollectionDto,
    responseType: 'list',
    summary: 'Get children of a collection',
  })
  async getChildren(
    @Param('id') id: string,
    @CurrentUser() user: UserEntity,
    @Query('offset') offset?: number,
    @Query('limit') limit?: number,
  ): Promise<CollectionDto[]> {
    const children = await this._collectionService.findChildren(id, user.id, {
      offset,
      limit,
    });

    return children.map((collection) =>
      this._collectionMapper.toResponseDto(collection),
    );
  }

  @Post()
  @ApiAuth({
    type: CollectionDto,
    summary: 'Create a new collection',
  })
  async create(
    @Body() createDto: CollectionCreateDto,
    @CurrentUser() user: UserEntity,
  ): Promise<CollectionDto> {
    const collection = await this._collectionService.create(
      {
        name: createDto.name,
        icon: createDto.icon,
        parentId: createDto.parentId,
        description: createDto.description,
        sortOrder: createDto.sortOrder,
      },
      user.id,
    );

    await this._collectionService.save();

    return this._collectionMapper.toResponseDto(collection);
  }

  @Put(':id')
  @ApiAuth({
    type: CollectionDto,
    summary: 'Update a collection',
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: CollectionUpdateDto,
    @CurrentUser() user: UserEntity,
  ): Promise<CollectionDto> {
    const collection = await this._collectionService.update(
      id,
      {
        name: updateDto.name,
        icon: updateDto.icon,
        description: updateDto.description,
        sortOrder: updateDto.sortOrder,
      },
      user.id,
    );

    await this._collectionService.save();

    return this._collectionMapper.toResponseDto(collection);
  }

  @ApiAuth({
    type: CollectionDto,
    summary: 'Move collection to new parent',
  })
  @Patch(':id/move')
  async move(
    @Param('id') id: string,
    @Body() moveDto: CollectionMoveDto,
    @CurrentUser() user: UserEntity,
  ): Promise<CollectionDto> {
    const collection = await this._collectionService.move(
      id,
      { newParentId: moveDto.newParentId },
      user.id,
    );

    await this._collectionService.save();

    return this._collectionMapper.toResponseDto(collection);
  }

  @ApiAuth({
    summary: 'Update sort order for multiple collections',
  })
  @Patch('sort-order')
  async updateSortOrder(
    @Body() updateSortOrderDto: UpdateSortOrderDto,
    @CurrentUser() user: UserEntity,
  ): Promise<{ success: boolean }> {
    await this._collectionService.updateSortOrder(
      updateSortOrderDto.collectionIds,
      user.id,
    );

    await this._collectionService.save();

    return { success: true };
  }

  @ApiAuth({
    type: CollectionDto,
    summary: 'Restore a soft-deleted collection',
  })
  @Patch(':id/restore')
  async restore(
    @Param('id') id: string,
    @CurrentUser() user: UserEntity,
  ): Promise<CollectionDto> {
    const collection = await this._collectionService.restore(id, user.id);
    await this._collectionService.save();

    return this._collectionMapper.toResponseDto(collection);
  }

  @ApiAuth({
    summary: 'Soft delete a collection and all its children',
  })
  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: UserEntity,
  ): Promise<{ success: boolean }> {
    await this._collectionService.delete(id, user.id);
    await this._collectionService.save();

    return { success: true };
  }

  @ApiAuth({
    summary: 'Permanently delete a collection',
  })
  @Delete(':id/permanent')
  async permanentDelete(
    @Param('id') id: string,
    @CurrentUser() user: UserEntity,
  ): Promise<{ success: boolean }> {
    await this._collectionService.permanentDelete(id, user.id);
    await this._collectionService.save();

    return { success: true };
  }
}
