import { inject, Injectable } from "@angular/core";
import {
  HttpService,
  PaginationResponseDto,
  SingleResponseDto,
} from "@client/web-core-http";
import { API_ENDPOINTS } from "@client/web-shared-constants";
import { Observable } from "rxjs";
import {
  BookmarkCreateDto,
  BookmarkDto,
  BookmarkQueryDto,
  BookmarkUpdateDto,
  MetadataDto,
  queryParamsToHttpParams,
} from "../models";

@Injectable({
  providedIn: "root",
})
export class BookmarkApi {
  private readonly _httpService = inject(HttpService);
  // Placeholder methods for future API integration

  loadBookmarks(
    request: BookmarkQueryDto
  ): Observable<PaginationResponseDto<BookmarkDto>> {
    const params = queryParamsToHttpParams(request) as any;
    return this._httpService.get<PaginationResponseDto<BookmarkDto>>(
      API_ENDPOINTS.BOOKMARKS.BASE,
      { params }
    );
  }

  /**
   * T019: Load bookmarks for a collection with filters, sorts, and pagination
   * Calls GET /collection/:id/bookmarks
   */
  loadCollectionBookmarks(
    collectionId: string,
    params?: {
      filters?: string[];
      sort?: string[];
      page?: number;
      limit?: number;
      tagFilterMode?: "AND" | "OR";
    }
  ): Observable<PaginationResponseDto<BookmarkDto>> {
    return this._httpService.get<PaginationResponseDto<BookmarkDto>>(
      API_ENDPOINTS.COLLECTIONS.BOOKMARKS(collectionId),
      { params }
    );
  }

  findBookmarkById(id: string): Observable<SingleResponseDto<BookmarkDto>> {
    return this._httpService.get<SingleResponseDto<BookmarkDto>>(
      API_ENDPOINTS.BOOKMARKS.BY_ID(id)
    );
  }

  createBookmark(request: BookmarkCreateDto): Observable<SingleResponseDto<BookmarkDto>> {
    return this._httpService.post<SingleResponseDto<BookmarkDto>>(
      API_ENDPOINTS.BOOKMARKS.BASE,
      request
    );
  }

  updateBookmark(
    request: BookmarkUpdateDto & { id: string }
  ): Observable<SingleResponseDto<BookmarkDto>> {
    return this._httpService.put<SingleResponseDto<BookmarkDto>>(
      API_ENDPOINTS.BOOKMARKS.BY_ID(request.id),
      request
    );
  }

  deleteBookmark(request: {
    id: string;
  }): Observable<SingleResponseDto<{ id: string; path: string }>> {
    return this._httpService.delete<SingleResponseDto<{ id: string; path: string }>>(
      API_ENDPOINTS.BOOKMARKS.BY_ID(request.id)
    );
  }

  /**
   * T045: Fetch metadata from URL
   * Calls GET /crawl/metadata?url={url}
   */
  fetchMetadata(url: string): Observable<SingleResponseDto<MetadataDto>> {
    return this._httpService.get<SingleResponseDto<MetadataDto>>(
      API_ENDPOINTS.CRAWL.METADATA,
      { params: { url } }
    );
  }

  /**
   * T047: Check if bookmark URL already exists for current user
   * Calls GET /bookmark/check-duplicate?url={url}
   */
  checkDuplicate(url: string): Observable<SingleResponseDto<BookmarkDto | null>> {
    return this._httpService.get<SingleResponseDto<BookmarkDto | null>>(
      API_ENDPOINTS.BOOKMARKS.CHECK_DUPLICATE,
      { params: { url } }
    );
  }
}
