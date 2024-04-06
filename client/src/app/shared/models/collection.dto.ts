import { BaseDto } from "./base.dto";

export class CollectionDto extends BaseDto {
  readonly title: string;
  readonly icon: string;
  readonly position: string;
  private constructor(data: CollectionDto) {
    super(data);
    this.title = data.title;
    this.icon = data.icon;
    this.position = data.position;
  }

  static from(data: CollectionDto): CollectionDto;
  static from(data: CollectionDto[]): CollectionDto[];
  static from(data: CollectionDto | CollectionDto[]): CollectionDto | CollectionDto[] {
    if (Array.isArray(data)) {
      return data.map(item => new CollectionDto(item));
    }

    return new CollectionDto(data);
  }
}

export type CreateCollectionDto = Omit<CollectionDto, keyof BaseDto | "position">;
export type UpdateCollectionDto = Omit<CollectionDto, keyof BaseDto | "position">;
export type MoveCollectionDto = { prevPosition: string; nextPosition: string };
