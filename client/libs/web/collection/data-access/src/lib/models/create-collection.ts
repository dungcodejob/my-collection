export type CreateCollectionRequest = {
  readonly path: string;

  readonly name: string;
  readonly icon?: string;
  readonly parentId?: string;
  readonly tagIds?: string[];
};
