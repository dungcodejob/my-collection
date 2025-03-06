import { Type } from "class-transformer";

export type Identity = string;

export class BaseVM {
  readonly id: Identity;
  @Type(() => Date)
  readonly updateAt: Date;
  @Type(() => Date)
  readonly createAt: Date;

  constructor(id: string, updateAt: string, createAt: string) {
    this.id = id;
    this.updateAt = new Date(updateAt);
    this.createAt = new Date(createAt);
  }
}
