import { IdentityType } from "@database/identifiable.entity";
import { CollectionItemDto } from "@modules/collection";

export interface BookmarkItemTagDto {
  readonly id: IdentityType;
  readonly title: string;
  readonly createAt: Date;
  readonly updateAt: Date;
}

export interface BookmarkItemDto {
  readonly id: IdentityType;
  readonly url: string;
  readonly domain: string;
  readonly title: string;
  readonly image: string;
  readonly description: string;
  readonly favicon: string;
  readonly note: string;
  readonly tags: BookmarkItemTagDto[];
  readonly collection: CollectionItemDto;
  readonly createAt: Date;
  readonly updateAt: Date;
}
