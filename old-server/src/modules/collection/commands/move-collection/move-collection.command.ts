export class MoveCollectionCommand {
  constructor(
    public readonly collectionId: string,
    public readonly prevPosition: string,
    public readonly nextPosition: string
  ) {}
}
