export class CreateTagCommand {
  constructor(
    public readonly title: string,
    public readonly collectionId: string
  ) {}
}
