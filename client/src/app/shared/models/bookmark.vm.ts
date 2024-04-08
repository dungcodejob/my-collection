import { BaseVM } from "./base.vm";

export interface BookmarkVM extends BaseVM {
  url: string;
  domain: string;
  title: string;
  image: string;
  description: string | null;
  favicon: string;
  note: string;
  collectionId: string;
}
