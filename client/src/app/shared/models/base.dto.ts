// export interface BaseDto {
//   readonly id: string;
//   readonly updateAt: string;
//   readonly createAt: string;
// }

export class BaseDto {
  readonly id: string;
  readonly updateAt: string;
  readonly createAt: string;

  constructor(id: string, updateAt: string, createAt: string) {
    this.id = id;
    this.updateAt = updateAt;
    this.createAt = createAt;
  }
}
