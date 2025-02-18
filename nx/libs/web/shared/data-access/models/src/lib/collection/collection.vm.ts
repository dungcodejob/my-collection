import { BaseVM } from "../generic/base.vm";



export class CollectionVM extends BaseVM {

  static CURRENT_INDEX = 0;

  readonly title: string;
  readonly icon: string;
  readonly position: string;
  readonly index: number;

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
    this.index = CollectionVM.CURRENT_INDEX++;
  }
}
