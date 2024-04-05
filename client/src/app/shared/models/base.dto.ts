export class BaseDto {
  readonly id: string;
  readonly updateAt: Date;
  readonly createAt: Date;

  constructor(data: BaseDto) {
    this.id = data.id;
    this.updateAt = new Date(data.updateAt);
    this.createAt = new Date(data.createAt);
  }
}
