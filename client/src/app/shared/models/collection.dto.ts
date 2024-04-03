import { BaseDto } from "./base.dto";

export interface CollectionDto extends BaseDto {
  readonly title: string;
  readonly icon: string;
}

export type CreateCollectionDto = Omit<CollectionDto, keyof BaseDto>;
export type UpdateCollectionDto = Omit<CollectionDto, keyof BaseDto>;
