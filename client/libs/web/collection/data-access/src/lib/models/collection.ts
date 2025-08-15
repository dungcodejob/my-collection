export type Collection = {
  readonly id: string;
  name: string;
  icon?: string;
  parentId?: string;
  children?: Collection[];
  isHasChild?: boolean;
  path: string;
  createdAt: Date;
  updatedAt: Date;
};
