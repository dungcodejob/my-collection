import { BaseDto } from "../base.dto";

export interface TagDto extends BaseDto {
  readonly title: string;
  readonly collectionId: string;
}

export type CreateTagDto = Omit<TagDto, keyof BaseDto>;
export type UpdateTagDto = Omit<TagDto, keyof BaseDto>;
