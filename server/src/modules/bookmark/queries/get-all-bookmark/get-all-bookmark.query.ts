export class GetAllBookmarkQuery {
  constructor(
    public readonly userId: string,
    public readonly keyword?: string,
    public readonly tagIds?: string[]
  ) {}
}
