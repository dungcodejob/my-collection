export class CreateBookmarkCommand {
  constructor(
    public readonly url: string,
    public readonly domain: string,
    public readonly title: string,
    public readonly image: string,
    public readonly description: string,
    public readonly favicon: string,
    public readonly note: string,
    public readonly collectionId: string
    // public readonly tagIds: IdentityType[]
  ) {}
}
