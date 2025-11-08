export type BookmarkCreateDto = {
  url: string;
  title: string;
  description?: string;
  imageUrl?: string;
  faviconUrl?: string;
  siteName?: string;
  collectionId?: string;
  tags?: string[];
  notes?: string;
};
