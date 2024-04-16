import { AccessTokenGuard } from "@authentication/guards";
import { CurrentUser } from "@common/decorators";
import { UserEntity } from "@common/entities";
import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { CreateTagBodyDto } from "./models";
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
    return this._tagMapper.toDto(tagEntity);
  }

  @Get()
  async GetAll(
    @CurrentUser() user: UserEntity,
    @Query("collectionId") collectionId: string
  ) {
    const tagEntities = await this._tagService.findAll(user.id, collectionId);
    return this._tagMapper.toDto(tagEntities);
  }
}
