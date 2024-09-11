import { BaseDto } from "../base.dto";

export class CollectionDto extends BaseDto {
  readonly title: string;
  readonly icon: string;
  readonly position: string;

  constructor(
    id: string,
    updateAt: string,
    createAt: string,
    title: string,
    icon: string,
    position: string
  ) {
    super(id, updateAt, createAt);
    this.title = title;
    this.icon = icon;
    this.position = position;
  }
}

export type CreateCollectionDto = Omit<CollectionDto, keyof BaseDto | "position">;

export type UpdateCollectionDto = Omit<CollectionDto, keyof BaseDto | "position">;

export interface MoveCollectionDto {
  prevPosition: string;
  nextPosition: string;
}
