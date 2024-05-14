import { IdentityType } from "@database/identifiable.entity";

export interface CreateBookmarkBodyDto {
  readonly url: string;
  readonly domain: string;
  readonly title: string;
  readonly image: string;
  readonly description: string;
  readonly favicon: string;
  readonly note: string;
  readonly collectionId: string;
  readonly tagIds: IdentityType[];
}
