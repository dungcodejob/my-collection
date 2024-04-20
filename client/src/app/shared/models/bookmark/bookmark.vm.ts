import { BaseVM } from "../base.vm";
import { TagVM } from "../tag/tag.vm";

export interface BookmarkVM extends BaseVM {
  url: string;
  domain: string;
  title: string;
  image: string;
  description: string | null;
  favicon: string;
  note: string;
  collectionId: string;
  tags: TagVM[];
}
