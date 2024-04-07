import { BookmarkEntity } from "@common/entities";
import { Injectable } from "@nestjs/common";
import { BookmarkItemDto } from "../models";

@Injectable()
export class BookmarkMapper {
  toItemDto(domain: BookmarkEntity): BookmarkItemDto;
  toItemDto(domain: BookmarkEntity[]): BookmarkItemDto[];
  toItemDto(
    domain: BookmarkEntity | BookmarkEntity[]
  ): BookmarkItemDto | BookmarkItemDto[] {
    if (Array.isArray(domain)) {
      return domain.map(item => this.toItemDto(item));
    }

    // const tags = domain.tags.map(tag => this._mapToTagDto(tag));
    return {
      id: domain.id,
      url: domain.url,
      domain: domain.domain,
      title: domain.title,
      image: domain.image,
      description: domain.description,
      favicon: domain.favicon,
      note: domain.note,
      // tags: tags,
      createAt: domain.createAt,
      updateAt: domain.updateAt,
    };
  }

  // private _mapToTagDto(domain: TagEntity): BookmarkItemTagDto {
  //   return {
  //     id: domain.id,
  //     title: domain.title,
  //     createAt: domain.createAt,
  //     updateAt: domain.updateAt,
  //   };
  // }
}
