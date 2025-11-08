import { BookmarkEntity } from '@app/entities';
import { Injectable } from '@nestjs/common';
import { CollectionMapper } from '../collection/collection.mapper';
import {
  BookmarkResponseDto,
  BookmarkStatsDto,
  BookmarkWithPaginationResponseDto,
} from './models';

@Injectable()
export class BookmarkMapper {
  constructor(private readonly _collectionMapper: CollectionMapper) {}

  /**
   * Convert BookmarkEntity to BookmarkResponseDto
   */
  toResponseDto(bookmark: BookmarkEntity): BookmarkResponseDto {
    return {
      id: bookmark.id,
      url: bookmark.url,
      title: bookmark.title,
      description: bookmark.description,
      imageUrl: bookmark.imageUrl,
      faviconUrl: bookmark.faviconUrl,
      siteName: bookmark.siteName,
      contentType: bookmark.contentType,
      metadata: bookmark.metadata,
      tags: bookmark.getTagsArray(),
      notes: bookmark.notes,
      isFavorite: bookmark.isFavorite,
      isActive: bookmark.isActive,
      visitCount: bookmark.visitCount || 0,
      lastVisitedAt: bookmark.lastVisitedAt,
      createAt: bookmark.createAt!,
      updateAt: bookmark.updateAt!,
    };
  }

  /**
   * Convert array of BookmarkEntity to array of BookmarkResponseDto
   */
  toResponseDtoArray(bookmarks: BookmarkEntity[]): BookmarkResponseDto[] {
    return bookmarks.map((bookmark) => this.toResponseDto(bookmark));
  }

  /**
   * Convert paginated bookmarks to BookmarkWithPaginationResponseDto
   */
  toPaginationResponseDto(
    bookmarks: BookmarkEntity[],
    total: number,
    offset: number,
    limit: number,
  ): BookmarkWithPaginationResponseDto {
    return {
      bookmarks: this.toResponseDtoArray(bookmarks),
      total,
      offset,
      limit,
      hasMore: offset + limit < total,
    };
  }

  /**
   * Convert bookmark stats to BookmarkStatsDto
   */
  toStatsDto(stats: {
    total: number;
    favorites: number;
    withCollection: number;
    withoutCollection: number;
    totalVisits: number;
  }): BookmarkStatsDto {
    return {
      total: stats.total,
      favorites: stats.favorites,
      withCollection: stats.withCollection,
      withoutCollection: stats.withoutCollection,
      totalVisits: stats.totalVisits,
    };
  }

  /**
   * Convert BookmarkEntity to summary object
   */
  toSummary(bookmark: BookmarkEntity): {
    id: string;
    url: string;
    title: string;
    description?: string;
    imageUrl?: string;
    isFavorite: boolean;
    visitCount: number;
    lastVisitedAt?: Date;
    tags: string[];
    collection?: {
      id: string;
      name: string;
    };
  } {
    return {
      id: bookmark.id,
      url: bookmark.url,
      title: bookmark.title,
      description: bookmark.description,
      imageUrl: bookmark.imageUrl,
      isFavorite: bookmark.isFavorite,
      visitCount: bookmark.visitCount || 0,
      lastVisitedAt: bookmark.lastVisitedAt,
      tags: bookmark.getTagsArray(),
      collection: bookmark.collection
        ? {
            id: bookmark.collection.id,
            name: bookmark.collection.name,
          }
        : undefined,
    };
  }

  /**
   * Convert array of BookmarkEntity to summary array
   */
  toSummaryArray(bookmarks: BookmarkEntity[]): Array<{
    id: string;
    url: string;
    title: string;
    description?: string;
    imageUrl?: string;
    isFavorite: boolean;
    visitCount: number;
    lastVisitedAt?: Date;
    tags: string[];
    collection?: {
      id: string;
      name: string;
    };
  }> {
    return bookmarks.map((bookmark) => this.toSummary(bookmark));
  }
}
