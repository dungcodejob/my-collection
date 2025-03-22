import { Type } from "class-transformer";

export type Identity = string;

export class BaseVM {
  readonly id: Identity;
  @Type(() => Date)
  readonly updateAt: Date;
  @Type(() => Date)
  readonly createAt: Date;

  constructor(data: BaseVM) {
    this.id = data.id;
    this.updateAt = data.updateAt;
    this.createAt = data.createAt;
  }
}
