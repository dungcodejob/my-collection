import { FEATURE_KEY, SWAGGER_SCHEME } from '@app/constants';
import { ApiAuth } from '@app/decorators';
import { ApiCustomQuery, ResponseBuilder } from '@app/models';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CollectionMapper } from './collection.mapper';
import { CollectionService } from './collection.service';
import {
  CollectionCreateDto,
  CollectionDto,
  CollectionQueryDto,
  CollectionUpdateDto,
} from './models';

@ApiTags(FEATURE_KEY.COLLECTION)
@ApiBearerAuth(SWAGGER_SCHEME.JWT_AUTH)
@Controller(FEATURE_KEY.COLLECTION)
export class CollectionController {
  constructor(
    private readonly _collectionService: CollectionService,
    private readonly _collectionMapper: CollectionMapper,
  ) {}

  @ApiCustomQuery()
  @ApiAuth({
    type: CollectionDto,
    responseType: 'list',
    summary: 'Get all collections for current user',
  })
  @Get()
  async findAll(@Query() query: CollectionQueryDto) {
    const collections = await this._collectionService.findByUserId(query);

    const items = collections.map((collection) =>
      this._collectionMapper.toResponseDto(collection),
    );

    return ResponseBuilder.toList({
      items,
      meta: {
        count: items.length,
      },
    });
  }

  // @ApiQuery({
  //   name: 'maxDepth',
  //   required: false,
  //   description: 'Maximum tree depth',
  // })
  // @ApiAuth({
  //   type: CollectionTreeResponseDto,
  //   responseType: 'list',
  //   summary: 'Get collection tree structure',
  // })
  // @Get('tree')
  // async getTree(
  //   @Query('maxDepth') maxDepth?: number,
  // ): Promise<CollectionTreeResponseDto[]> {
  //   const collections = await this._collectionService.findCollectionTree(
  //     maxDepth || 5,
  //   );

  //   return collections.map((collection) =>
  //     this._collectionMapper.toTreeResponseDto(collection),
  //   );
  // }

  // @Get('root')
  // @ApiQuery({
  //   name: 'offset',
  //   required: false,
  //   description: 'Pagination offset',
  // })
  // @ApiQuery({ name: 'limit', required: false, description: 'Pagination limit' })
  // @ApiAuth({
  //   type: CollectionDto,
  //   responseType: 'list',
  //   summary: 'Get root collections (collections without parent)',
  // })
  // async findRootCollections(
  //   @Query('offset') offset?: number,
  //   @Query('limit') limit?: number,
  // ): Promise<CollectionDto[]> {
  //   const collections = await this._collectionService.findRootCollections({
  //     offset,
  //     limit,
  //   });

  //   return collections.map((collection) =>
  //     this._collectionMapper.toResponseDto(collection),
  //   );
  // }

  // @Get('paginated')
  // @ApiQuery({
  //   name: 'offset',
  //   required: false,
  //   description: 'Pagination offset',
  // })
  // @ApiQuery({ name: 'limit', required: false, description: 'Pagination limit' })
  // @ApiResponse({ type: CollectionWithPaginationResponseDto })
  // @ApiAuth({
  //   type: CollectionWithPaginationResponseDto,
  //   summary: 'Get collections with pagination',
  // })
  // async findWithPagination(
  //   @CurrentUser() user: UserEntity,
  //   @Query('offset') offset?: number,
  //   @Query('limit') limit?: number,
  // ): Promise<CollectionWithPaginationResponseDto> {
  //   const result = await this._collectionService.findWithPagination(user.id, {
  //     offset,
  //     limit,
  //   });

  //   return {
  //     collections: result.collections.map((collection) =>
  //       this._collectionMapper.toResponseDto(collection),
  //     ),
  //     total: result.total,
  //     offset: offset || 0,
  //     limit: limit || 20,
  //   };
  // }

  // @Get('count')
  // @ApiOperation({ summary: 'Get total count of collections for current user' })
  // @ApiResponse({
  //   schema: { type: 'object', properties: { count: { type: 'number' } } },
  // })
  // @ApiAuth({
  //   type: { count: { type: 'number' } } as any,
  //   summary: 'Get total count of collections for current user',
  // })
  // async getCount(@CurrentUser() user: UserEntity): Promise<{ count: number }> {
  //   const count = await this._collectionService.countByUser(user.id);
  //   return { count };
  // }

  // @Get(':id')
  // @ApiQuery({
  //   name: 'includeChildren',
  //   required: false,
  //   description: 'Include children in response',
  // })
  // @ApiAuth({
  //   type: CollectionDto,
  //   summary: 'Get collection by ID',
  // })
  // async findOne(
  //   @Param('id') id: string,

  //   @Query('includeChildren') includeChildren?: boolean,
  // ): Promise<CollectionDto> {
  //   const collection = await this._collectionService.findOneByIdOrFail(id, {
  //     includeChildren,
  //   });

  //   return this._collectionMapper.toResponseDto(collection);
  // }

  // @Get(':id/children')
  // @ApiQuery({
  //   name: 'offset',
  //   required: false,
  //   description: 'Pagination offset',
  // })
  // @ApiQuery({ name: 'limit', required: false, description: 'Pagination limit' })
  // @ApiAuth({
  //   type: CollectionDto,
  //   responseType: 'list',
  //   summary: 'Get children of a collection',
  // })
  // async getChildren(
  //   @Param('id') id: string,
  //   @Query('offset') offset?: number,
  //   @Query('limit') limit?: number,
  // ): Promise<CollectionDto[]> {
  //   const children = await this._collectionService.findChildren(id, {
  //     offset,
  //     limit,
  //   });

  //   return children.map((collection) =>
  //     this._collectionMapper.toResponseDto(collection),
  //   );
  // }

  @Post()
  @ApiAuth({
    type: CollectionDto,
    summary: 'Create a new collection',
  })
  async create(@Body() createDto: CollectionCreateDto) {
    const collection = await this._collectionService.create({
      name: createDto.name,
      icon: createDto.icon,
      parentId: createDto.parentId,
      description: createDto.description,
      sortOrder: createDto.sortOrder,
      tagIds: createDto.tagIds,
    });

    await this._collectionService.save();

    // Fetch tags for response
    const tags = await this._collectionService.getTagsForCollection(
      collection.id,
    );
    const result = this._collectionMapper.toResponseDto(collection, tags);

    return ResponseBuilder.toSingle({
      data: result,
    });
  }

  @Put(':id')
  @ApiAuth({
    type: CollectionDto,
    summary: 'Update a collection',
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: CollectionUpdateDto,
  ) {
    const collection = await this._collectionService.update(id, {
      name: updateDto.name,
      icon: updateDto.icon,
      description: updateDto.description,
      sortOrder: updateDto.sortOrder,
      tagIds: updateDto.tagIds,
    });

    await this._collectionService.save();

    // Fetch tags for response
    const tags = await this._collectionService.getTagsForCollection(
      collection.id,
    );
    const result = this._collectionMapper.toResponseDto(collection, tags);

    return ResponseBuilder.toSingle({
      data: result,
    });
  }

  // @ApiAuth({
  //   type: CollectionDto,
  //   summary: 'Move collection to new parent',
  // })
  // @Patch(':id/move')
  // async move(
  //   @Param('id') id: string,
  //   @Body() moveDto: CollectionMoveDto,
  //   @CurrentUser() user: UserEntity,
  // ): Promise<CollectionDto> {
  //   const collection = await this._collectionService.move(
  //     id,
  //     { newParentId: moveDto.newParentId },
  //     user.id,
  //   );

  //   await this._collectionService.save();

  //   return this._collectionMapper.toResponseDto(collection);
  // }

  // @ApiAuth({
  //   type: CollectionDto,
  //   summary: 'Restore a soft-deleted collection',
  // })
  // @Patch(':id/restore')
  // async restore(
  //   @Param('id') id: string,
  //   @CurrentUser() user: UserEntity,
  // ): Promise<CollectionDto> {
  //   const collection = await this._collectionService.restore(id, user.id);
  //   await this._collectionService.save();

  //   return this._collectionMapper.toResponseDto(collection);
  // }

  @ApiAuth({
    summary: 'Soft delete a collection and all its children',
  })
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ success: boolean }> {
    await this._collectionService.delete(id);
    await this._collectionService.save();

    return { success: true };
  }
}
