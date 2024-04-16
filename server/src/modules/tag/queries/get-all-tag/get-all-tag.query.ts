export class GetAllTagQuery {
  constructor(
    public readonly userId: string,
    public readonly collectionId?: string
  ) {}
}
