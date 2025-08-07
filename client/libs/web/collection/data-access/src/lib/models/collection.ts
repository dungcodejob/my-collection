export type Collection = {
  readonly id: string;
  name: string;
  icon?: string;
  parentId?: string;
  children?: Collection[];
  path: string;
  createdAt: Date;
  updatedAt: Date;
};
