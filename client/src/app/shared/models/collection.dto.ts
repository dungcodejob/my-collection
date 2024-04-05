import { BaseDto } from "./base.dto";

export class CollectionDto extends BaseDto {
  readonly title: string;
  readonly icon: string;

  private constructor(data: CollectionDto) {
    super(data);
    this.title = data.title;
    this.icon = data.icon;
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

export type CreateCollectionDto = Omit<CollectionDto, keyof BaseDto>;
export type UpdateCollectionDto = Omit<CollectionDto, keyof BaseDto>;
