import { plainToClass, plainToInstance } from "class-transformer";
import { BaseDto } from "../generic/base.dto";
import { CollectionVM } from "./collection.vm";

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

  static fromVM(data: CollectionVM): CollectionDto;
  static fromVM(data: CollectionVM[]): CollectionDto[];
  static fromVM(data: CollectionVM | CollectionVM[]): CollectionDto | CollectionDto[] {
    if (Array.isArray(data)) {
      return data.map(item => this.fromVM(item));
    } else {
      return plainToInstance(CollectionDto, data);
    }
  }

  static toVM(data: CollectionDto): CollectionVM;
  static toVM(data: CollectionDto[]): CollectionVM[];
  static toVM(data: CollectionDto | CollectionDto[]): CollectionVM | CollectionVM[] {
    if (Array.isArray(data)) {
      return data.map(item => this.toVM(item));
    } else {
      return plainToInstance(CollectionVM, data);
    }
  }
}

export type CreateCollectionDto = Omit<CollectionDto, keyof BaseDto | "position">;

export type UpdateCollectionDto = Omit<CollectionDto, keyof BaseDto | "position"> & {
  id: BaseDto["id"];
};

export interface MoveCollectionDto {
  prevPosition: string;
  nextPosition: string;
}
