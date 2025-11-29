import { TagSummary } from '@client/tag-data-access';

export type Collection = {
  readonly id: string;
  name: string;
  icon?: string;
  parentId?: string;
  children?: Collection[];
  isHasChild?: boolean;
  parentPath?: string;
  path: string;
  tags?: TagSummary[];
  createdAt: Date;
  updatedAt: Date;
};
