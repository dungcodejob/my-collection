export class UpdateCollectionCommand {
  constructor(
    public readonly collectionId: string,
    public readonly title: string,
  ) {}
}
