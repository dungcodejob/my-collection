export type UpdateCollectionRequest = {
  readonly path: string;

  readonly id: string;
  readonly name?: string;
  readonly icon?: string;
  readonly parentPath?: string;
  readonly parentId?: string;
  readonly tagIds?: string[];
};
