export type UpdateTagRequest = {
  readonly id: string;
  readonly name?: string;
  readonly description?: string;
  readonly color?: string;
  readonly category?: string;
  readonly collectionId: string;
};
