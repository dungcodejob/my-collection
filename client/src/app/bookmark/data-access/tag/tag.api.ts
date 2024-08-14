import { PaginationResponseDto, SingleResponseDto } from "@core/http";
import { CreateTagDto, TagQueryDto, TagVM } from "@shared/models";
import { Observable } from "rxjs";

export interface TagApi {
  findAll(query: TagQueryDto): Observable<PaginationResponseDto<TagVM>>;
  create(body: CreateTagDto): Observable<SingleResponseDto<TagVM>>;
}
