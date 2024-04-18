import { BaseVM } from "../base.vm";

export interface TagVM extends BaseVM {
  readonly title: string;
  readonly collectionId: string;
}
