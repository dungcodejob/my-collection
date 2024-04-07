import { PaginationResponseDto, SingleResponseDto } from "@core/http";
import {
  BookmarkDto,
  BookmarkQueryDto,
  CreateBookmarkDto,
  UpdateBookmarkDto,
} from "@shared/models";
import { Observable } from "rxjs";

export interface BookmarkApi {
  findAll(query: BookmarkQueryDto): Observable<PaginationResponseDto<BookmarkDto>>;
  create(body: CreateBookmarkDto): Observable<SingleResponseDto<BookmarkDto>>;
  update(id: string, body: UpdateBookmarkDto): Observable<SingleResponseDto<BookmarkDto>>;
  delete(id: string): Observable<SingleResponseDto<void>>;
}
