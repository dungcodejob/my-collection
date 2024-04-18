import { BaseDto } from "../base.dto";

export interface CollectionDto extends BaseDto {
  readonly title: string;
  readonly icon: string;
  readonly position: string;
}

export type CreateCollectionDto = Omit<CollectionDto, keyof BaseDto | "position">;
export type UpdateCollectionDto = Omit<CollectionDto, keyof BaseDto | "position">;
export type MoveCollectionDto = { prevPosition: string; nextPosition: string };
