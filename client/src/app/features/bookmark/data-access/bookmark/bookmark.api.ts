import { PaginationResponseDto, SingleResponseDto } from "@core/http";
import {
  BookmarkQueryDto,
  BookmarkVM,
  CreateBookmarkDto,
  UpdateBookmarkDto,
} from "@shared/models";
import { Observable } from "rxjs";

export interface BookmarkApi {
  findAll(query: BookmarkQueryDto): Observable<PaginationResponseDto<BookmarkVM>>;
  create(body: CreateBookmarkDto): Observable<SingleResponseDto<BookmarkVM>>;
  update(id: string, body: UpdateBookmarkDto): Observable<SingleResponseDto<BookmarkVM>>;
  delete(id: string): Observable<SingleResponseDto<void>>;
}
