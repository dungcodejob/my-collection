export class GetBookmarkInCollectionQuery {
  constructor(
    public readonly collectionId: string,
    public readonly keyword?: string,
    public readonly tagIds?: string[]
  ) {}
}
