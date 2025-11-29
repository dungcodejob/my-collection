import { inject, Injectable } from "@angular/core";
import { HttpService, ListResponseDto, SingleResponseDto } from "@client/web-core-http";
import { API_ENDPOINTS } from "@client/web-shared-constants";
import { Observable } from "rxjs";
import { CreateTagRequest, Tag, TagFilter, UpdateTagRequest } from "../models";

@Injectable({
  providedIn: "root",
})
export class TagApi {
  private readonly _httpService = inject(HttpService);

  loadTags(request: TagFilter): Observable<ListResponseDto<Tag>> {
    return this._httpService.get<ListResponseDto<Tag>>(API_ENDPOINTS.TAGS.BASE, {
      params: request,
    });
  }

  findTagById(id: string): Observable<SingleResponseDto<Tag>> {
    return this._httpService.get<SingleResponseDto<Tag>>(API_ENDPOINTS.TAGS.BY_ID(id));
  }

  createTag(request: CreateTagRequest): Observable<SingleResponseDto<Tag>> {
    return this._httpService.post<SingleResponseDto<Tag>>(
      API_ENDPOINTS.TAGS.BASE,
      request
    );
  }

  updateTag(request: UpdateTagRequest): Observable<SingleResponseDto<Tag>> {
    return this._httpService.put<SingleResponseDto<Tag>>(
      API_ENDPOINTS.TAGS.BY_ID(request.id),
      request
    );
  }

  deleteTag(id: string): Observable<SingleResponseDto<Tag>> {
    return this._httpService.delete<SingleResponseDto<Tag>>(API_ENDPOINTS.TAGS.BY_ID(id));
  }

  /**
   * Get popular tags for autocomplete suggestions
   */
  getPopularTags(limit = 20): Observable<ListResponseDto<Tag>> {
    return this._httpService.get<ListResponseDto<Tag>>(API_ENDPOINTS.TAGS.POPULAR, {
      params: { limit: limit.toString() },
    });
  }
}
