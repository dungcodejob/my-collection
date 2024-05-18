import { BaseVM } from "../base.vm";

export interface CollectionVM extends BaseVM {
  readonly title: string;
  readonly icon: string;
  readonly position: string;
}
