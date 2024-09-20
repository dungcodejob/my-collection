import { BaseVM } from "../base.vm";

export class CollectionVM extends BaseVM {
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
}
