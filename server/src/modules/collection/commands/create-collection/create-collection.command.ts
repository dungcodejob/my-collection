export class CreateCollectionCommand {
  constructor(
    public readonly title: string,
    public readonly userId: string,
    public readonly parentId?: string,
  ) {}
}
