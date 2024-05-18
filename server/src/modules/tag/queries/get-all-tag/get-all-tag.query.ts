export class GetAllTagQuery {
  constructor(
    public readonly userId: string,
    public readonly keyword?: string,
    public readonly collectionId?: string
  ) {}
}
