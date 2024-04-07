import { IdentityType } from "@database/identifiable.entity";

export class DeleteBookmarkCommand {
  constructor(public readonly id: IdentityType) {}
}
