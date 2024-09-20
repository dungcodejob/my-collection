import { BaseDto } from "../base.dto";

export class TagDto extends BaseDto {
  readonly title: string;
  readonly collectionId: string;

  constructor(
    id: string,
    updateAt: string,
    createAt: string,
    title: string,
    collectionId: string
  ) {
    super(id, updateAt, createAt);
    this.title = title;
    this.collectionId = collectionId;
  }
}

export type CreateTagDto = Omit<TagDto, keyof BaseDto>;
export type UpdateTagDto = Omit<TagDto, keyof BaseDto>;
