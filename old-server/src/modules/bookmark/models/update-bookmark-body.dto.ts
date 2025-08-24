import { IdentityType } from "@database/identifiable.entity";

export interface UpdateBookmarkBodyDto {
  readonly title: string;
  readonly image: string;
  readonly description: string;
  readonly favicon: string;
  readonly note: string;
  readonly collectionId: string;
  readonly tagIds: IdentityType[];
}
