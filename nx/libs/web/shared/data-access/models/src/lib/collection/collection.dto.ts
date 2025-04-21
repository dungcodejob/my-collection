import { faker } from "@faker-js/faker";
import { BaseDto } from "../generic/base.dto";
import { Builder } from "../generic/builder";

export class CollectionDto extends BaseDto {
  readonly title: string;
  readonly icon: string;
  readonly position: string;

  constructor(data: {
    id: string;
    updateAt: string;
    createAt: string;
    title: string;
    icon: string;
    position: string;
  }) {
    super(data);
    this.title = data.title;
    this.icon = data.icon;
    this.position = data.position;
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

export class CollectionDtoBuilder extends Builder<CollectionDto> {
  setDefaults(): Partial<CollectionDto> {
    return {
      id: faker.string.uuid(),
      icon: faker.string.symbol(),
      createAt: faker.date.anytime().toString(),
      position: faker.string.symbol(),
      updateAt: faker.date.anytime().toString(),
      title: faker.string.symbol(),
    };
  }
}
