export type Identity = string;

export class BaseVM {
  readonly id: Identity;
  readonly updateAt: Date;
  readonly createAt: Date;

  constructor(data: BaseVM) {
    this.id = data.id;
    this.updateAt = data.updateAt;
    this.createAt = data.createAt;
  }
}
