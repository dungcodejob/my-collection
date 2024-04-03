import { CurrentUser } from "@common/decorators";
import { UserEntity } from "@common/entities";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import {
  CollectionItemDto,
  CreateCollectionBodyDto,
  UpdateCollectionBodyDto,
} from "./models";

import { AccessTokenGuard } from "@authentication/guards";
import { Result, SingleResultDto } from "@common/models";
import { CollectionMapper, CollectionService } from "./services";

@UseGuards(AccessTokenGuard)
@Controller("collection")
export class CollectionController {
  constructor(
    private readonly _collectionService: CollectionService,
    private readonly _collectionMapper: CollectionMapper
  ) {}

  @Get()
  async getAll(@CurrentUser() user: UserEntity) {
    const collectionEntities = await this._collectionService.findAll(user.id);

    const items = this._collectionMapper.toItemDto(collectionEntities);

    return Result.toList(items);
  }

  @Put()
  async create(
    @CurrentUser() user: UserEntity,
    @Body() dto: CreateCollectionBodyDto
  ): Promise<SingleResultDto<CollectionItemDto>> {
    const collectionEntity = await this._collectionService.create(user.id, dto);
    const collectionDto = this._collectionMapper.toItemDto(collectionEntity);

    return Result.toSingle(collectionDto);
  }

  @Post(":id")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateCollectionBodyDto
  ): Promise<SingleResultDto<CollectionItemDto>> {
    const collectionEntity = await this._collectionService.update(id, dto);
    const collectionDto = this._collectionMapper.toItemDto(collectionEntity);

    return Result.toSingle(collectionDto);
  }

  @Delete(":id")
  async delete(@Param("id") id: string): Promise<void> {
    return this._collectionService.delete(id);
  }
}
