export type MoveCollectionRequest = {
  readonly id: string;
  readonly newParentId?: string;
  readonly newPosition: number;
};
