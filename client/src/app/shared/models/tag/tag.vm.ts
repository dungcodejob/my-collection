import { BaseVM } from "../base.vm";

export class TagVM extends BaseVM {
  readonly title: string;
  readonly collectionId: string;

  constructor(
    id: string,
    updateAt: string,
    createAt: string,
    title: string,
    collectionId: string
  ) {
    super(id, updateAt, createAt);
    this.title = title;
    this.collectionId = collectionId;
  }
}
