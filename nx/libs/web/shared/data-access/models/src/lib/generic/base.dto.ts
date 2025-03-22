import { Identity } from "./base.vm";

export class BaseDto {
  readonly id: Identity;
  readonly updateAt: string;
  readonly createAt: string;

  constructor(data: BaseDto) {
    this.id = data.id;
    this.updateAt = data.updateAt;
    this.createAt = data.createAt;
  }
}
