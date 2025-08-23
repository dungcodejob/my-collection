export type UpdateCollectionRequest = {
  readonly path: string;

  readonly id: string;
  readonly name?: string;
  readonly icon?: string;
  readonly childPath: string;
  readonly parentId?: string;
};
