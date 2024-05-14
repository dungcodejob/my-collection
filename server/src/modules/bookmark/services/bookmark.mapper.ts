import { BookmarkEntity } from "@common/entities";
import { TagMapper } from "@modules/tag";
import { Injectable } from "@nestjs/common";
import { BookmarkItemDto } from "../models";

@Injectable()
export class BookmarkMapper {
  constructor(private readonly tagMapper: TagMapper) {}

  toItemDto(domain: BookmarkEntity): BookmarkItemDto;
  toItemDto(domain: BookmarkEntity[]): BookmarkItemDto[];
  toItemDto(
    domain: BookmarkEntity | BookmarkEntity[]
  ): BookmarkItemDto | BookmarkItemDto[] {
    if (Array.isArray(domain)) {
      return domain.map(item => this.toItemDto(item));
    }

    const tags = this.tagMapper.toDto(domain.tags.getSnapshot());
    return {
      id: domain.id,
      url: domain.url,
      domain: domain.domain,
      title: domain.title,
      image: domain.image,
      description: domain.description,
      favicon: domain.favicon,
      note: domain.note,
      tags: tags,
      createAt: domain.createAt,
      updateAt: domain.updateAt,
    };
  }
}
