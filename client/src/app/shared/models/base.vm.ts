import { Type } from "class-transformer";

export class BaseVM {
  readonly id: string;
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
