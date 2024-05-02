import { BaseVM } from "../base.vm";
import { TagVM } from "../tag/tag.vm";

export interface BookmarkVM extends BaseVM {
  url: string;
  domain: string;
  title: string;
  image: string | null;
  description: string | null;
  favicon: string | null;
  note: string | null;
  collectionId: string;
  tags: TagVM[];
}
