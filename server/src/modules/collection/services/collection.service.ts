import { CollectionEntity } from "@common/entities";
import { Injectable } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import {
  CreateCollectionCommand,
  DeleteCollectionCommand,
  UpdateCollectionCommand,
} from "../commands";
import { CreateCollectionBodyDto, UpdateCollectionBodyDto } from "../models";
import { GetAllCollectionQuery } from "../queries";

@Injectable()
export class CollectionService {
  constructor(
    private readonly _commandBus: CommandBus,
    private readonly _queryBus: QueryBus
  ) {}

  async findAll(userId: string): Promise<CollectionEntity[]> {
    return this._queryBus.execute(new GetAllCollectionQuery(userId));
  }

  async create(userId: string, dto: CreateCollectionBodyDto): Promise<CollectionEntity> {
    const command = new CreateCollectionCommand(dto.title, userId, dto.parentId);

    return this._commandBus.execute(command);
  }

  async update(
    collectionId: string,
    dto: UpdateCollectionBodyDto
  ): Promise<CollectionEntity> {
    const command = new UpdateCollectionCommand(collectionId, dto.title);

    return this._commandBus.execute(command);
  }

  async delete(collectionId: string): Promise<void> {
    const command = new DeleteCollectionCommand(collectionId);
    return this._commandBus.execute(command);
  }
}
