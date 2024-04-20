import { AccessTokenGuard } from "@authentication/guards";
import { CurrentUser } from "@common/decorators";
import { UserEntity } from "@common/entities";
import { PaginationMetaDto, Result } from "@common/models";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { BookmarkFilterDto } from "./models";
import { CreateBookmarkBodyDto } from "./models/create-bookmark-body.dto";
import { UpdateBookmarkBodyDto } from "./models/update-bookmark-body.dto";
import { BookmarkMapper, BookmarkService } from "./services";

@UseGuards(AccessTokenGuard)
@Controller("bookmark")
export class BookmarkController {
  constructor(
    private readonly _bookmarkService: BookmarkService,
    private readonly _bookmarkMapper: BookmarkMapper
  ) {}

  @Get()
  async getAll(@CurrentUser() user: UserEntity, @Query() dto: BookmarkFilterDto) {

    if (dto.collectionId) {
      const bookmarkEntities = await this._bookmarkService.findByCollectionId(
        dto.collectionId,
        dto
      );

      const items = this._bookmarkMapper.toItemDto(bookmarkEntities);
      return Result.toPagination(
        items,
        new PaginationMetaDto({ parameter: dto, total: items.length })
      );
    } else {
      const bookmarkEntities = await this._bookmarkService.findAll(user.id, dto);

      const items = this._bookmarkMapper.toItemDto(bookmarkEntities);
      return Result.toPagination(
        items,
        new PaginationMetaDto({ parameter: dto, total: items.length })
      );
    }
  }

  @Post()
  async create(@Body() dto: CreateBookmarkBodyDto) {
    const bookmarkEntity = await this._bookmarkService.create(dto);

    const data = this._bookmarkMapper.toItemDto(bookmarkEntity);
    return Result.toSingle(data);
  }

  @Put(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateBookmarkBodyDto) {
    const bookmarkEntity = await this._bookmarkService.update(id, dto);

    const data = this._bookmarkMapper.toItemDto(bookmarkEntity);
    return Result.toSingle(data);
  }

  @Delete(":id")
  async delete(@Param("id") id: string) {
    await this._bookmarkService.delete(id);
    return Result.toSingle({ id });
  }
}
