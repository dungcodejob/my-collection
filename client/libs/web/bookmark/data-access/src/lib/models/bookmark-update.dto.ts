export type BookmarkUpdateDto = {
  title?: string;

  description?: string;

  imageUrl?: string;

  siteName?: string;

  collectionId?: string;

  tags?: string[];

  notes?: string;

  isFavorite?: boolean;
};
