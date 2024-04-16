import { TagEntity } from "@common/entities";
import { Injectable } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { CreateTagCommand } from "../commands";
import { CreateTagBodyDto } from "../models";
import { GetAllTagQuery } from "../queries";

@Injectable()
export class TagService {
  constructor(
    private readonly _commandBus: CommandBus,
    private readonly _queryBus: QueryBus
  ) {}

  async findAll(userId: string, collectionId?: string): Promise<TagEntity[]> {
    return this._queryBus.execute(new GetAllTagQuery(userId, collectionId));
  }

  async create(dto: CreateTagBodyDto): Promise<TagEntity> {
    return this._commandBus.execute(new CreateTagCommand(dto.title, dto.collectionId));
  }
}
