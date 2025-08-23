export type Collection = {
  readonly id: string;
  name: string;
  icon?: string;
  parentId?: string;
  children?: Collection[];
  isHasChild?: boolean;
  childPath: string;
  createdAt: Date;
  updatedAt: Date;
};
