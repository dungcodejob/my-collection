import { AccessTokenGuard } from "@authentication/guards";
import { CurrentUser } from "@common/decorators";
import { UserEntity } from "@common/entities";
import { PaginationMetaDto, Result } from "@common/models";
import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { CreateTagBodyDto, TagQueryDto } from "./models";
import { TagMapper, TagService } from "./services";

@UseGuards(AccessTokenGuard)
@Controller("tag")
export class TagController {
  constructor(
    private readonly _tagService: TagService,
    private readonly _tagMapper: TagMapper
  ) {}

  @Post()
  async create(@Body() body: CreateTagBodyDto) {
    const tagEntity = await this._tagService.create(body);
    const dto = this._tagMapper.toDto(tagEntity);
    return Result.toSingle(dto);
  }

  @Get()
  async GetAll(@CurrentUser() user: UserEntity, @Query() query: TagQueryDto) {
    const tagEntities = await this._tagService.findAll(user.id, query);
    const meta = new PaginationMetaDto({
      parameter: { currentPage: 1, pageSize: 10 },
      total: tagEntities.length,
    });
    const dto = this._tagMapper.toDto(tagEntities);
    return Result.toPagination(dto, meta);
  }
}
