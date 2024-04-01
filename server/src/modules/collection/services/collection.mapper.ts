import { CollectionEntity } from "@common/entities";
import { Injectable } from "@nestjs/common";
import { CollectionDto, CollectionItemDto } from "../models";

@Injectable()
export class CollectionMapper {
  toItemDto(domain: CollectionEntity): CollectionItemDto;
  toItemDto(domain: CollectionEntity[]): CollectionItemDto[];
  toItemDto(
    domain: CollectionEntity | CollectionEntity[]
  ): CollectionItemDto | CollectionItemDto[] {
    if (Array.isArray(domain)) {
      return domain.map(item => this.toItemDto(item));
    }
    return {
      id: domain.id,
      title: domain.title,
      createAt: domain.createAt,
      updateAt: domain.updateAt,
    };
  }

  toDto(domain: CollectionEntity): CollectionDto {
    return {
      id: domain.id,
      title: domain.title,
      createAt: domain.createAt,
      updateAt: domain.updateAt,
    };
  }
}
