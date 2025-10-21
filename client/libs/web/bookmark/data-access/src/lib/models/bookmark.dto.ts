export type BookmarkDto = {
  id: string;
  url: string;
  title: string;
  description?: string;
  imageUrl?: string;
  siteName?: string;
  contentType?: string;
  metadata?: Record<string, any>;
  tags?: string[];
  notes?: string;
  isFavorite: boolean;
  isActive: boolean;
  visitCount: number;
  lastVisitedAt?: Date;
  createAt: Date;
  updateAt: Date;
};
