import { PaginationResponseDto, SingleResponseDto } from "@core/http";
import { CreateTagDto, TagDto, TagQueryDto } from "@shared/models";
import { Observable } from "rxjs";

export interface TagApi {
  findAll(query: TagQueryDto): Observable<PaginationResponseDto<TagDto>>;
  create(body: CreateTagDto): Observable<SingleResponseDto<TagDto>>;
}
