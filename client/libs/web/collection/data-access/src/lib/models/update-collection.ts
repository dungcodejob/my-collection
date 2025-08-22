export type UpdateCollectionRequest = {
  readonly parentId?: string;

  readonly id: string;
  readonly name?: string;
  readonly icon?: string;
  readonly path: string;
};
