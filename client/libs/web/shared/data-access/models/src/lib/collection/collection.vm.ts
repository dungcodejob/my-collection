import { Exclude } from "class-transformer";
import { BaseVM } from "../generic/base.vm";
import { faker } from "@faker-js/faker";
import { Builder } from "../generic/builder";

export class CollectionVM extends BaseVM {
  static CURRENT_INDEX = 0;

  readonly title: string;
  readonly icon: string;
  readonly position: string;
  readonly index: number;

  constructor(data: {
    id: string;
    updateAt: Date;
    createAt: Date;
    title: string;
    icon: string;
    position: string;
  }) {
    super(data);
    this.title = data.title;
    this.icon = data.icon;
    this.position = data.position;
    this.index = CollectionVM.CURRENT_INDEX++;
  }
}

export class CollectionVMBuilder extends Builder<CollectionVM> {
  setDefaults(): Partial<CollectionVM> {
    return {
      id: faker.string.uuid(),
      icon: faker.string.symbol(),
      createAt: faker.date.anytime(),
      position: faker.string.symbol(),
      updateAt: faker.date.anytime(),
      title: faker.string.symbol(),
      index: faker.number.int(),
    };
  }
}
