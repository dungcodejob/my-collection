import { inject, Injectable } from "@angular/core";
import { HttpService, ListResponseDto, SingleResponseDto } from "@client/web-core-http";
import { API_ENDPOINTS } from "@client/web-shared-constants";
import { Observable } from "rxjs";
import {
  BookmarkCreateDto,
  BookmarkDto,
  BookmarkUpdateDto,
  MetadataDto,
} from "../models";

@Injectable({
  providedIn: "root",
})
export class BookmarkApi {
  private readonly _httpService = inject(HttpService);
  // Placeholder methods for future API integration

  loadBookmarks(request: {
    collectionId: string;
  }): Observable<ListResponseDto<BookmarkDto>> {
    return this._httpService.get<ListResponseDto<BookmarkDto>>(
      API_ENDPOINTS.BOOKMARKS.BASE,
      { params: request }
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
  checkDuplicate(url: string): Observable<
    SingleResponseDto<{
      exists: boolean;
      bookmark: {
        id: string;
        title: string;
        createdAt: string;
        imageUrl: string | null;
      } | null;
    }>
  > {
    return this._httpService.get<
      SingleResponseDto<{
        exists: boolean;
        bookmark: {
          id: string;
          title: string;
          createdAt: string;
          imageUrl: string | null;
        } | null;
      }>
    >(API_ENDPOINTS.BOOKMARKS.CHECK_DUPLICATE, { params: { url } });
  }
}
