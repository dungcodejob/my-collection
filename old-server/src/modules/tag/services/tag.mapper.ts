import { TagEntity } from "@common/entities";
import { Injectable } from "@nestjs/common";
import { TagDto } from "../models";

@Injectable()
export class TagMapper {
  toDto(domain: TagEntity): TagDto;
  toDto(domain: TagEntity[]): TagDto[];
  toDto(domain: TagEntity | TagEntity[]): TagDto | TagDto[] {
    if (Array.isArray(domain)) {
      return domain.map(item => this.toDto(item));
    }
    return {
      id: domain.id,
      title: domain.title,
      createAt: domain.createAt,
      updateAt: domain.updateAt,
    };
  }
}
