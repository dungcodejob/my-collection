import { ListResponseDto, SingleResponseDto } from "@core/http";
import { CollectionDto, CreateCollectionDto, UpdateCollectionDto } from "@shared/models";
import { Observable } from "rxjs";

export interface CollectionApi {
  findAll(): Observable<ListResponseDto<CollectionDto>>;
  create(body: CreateCollectionDto): Observable<SingleResponseDto<CollectionDto>>;
  update(
    id: string,
    body: UpdateCollectionDto
  ): Observable<SingleResponseDto<CollectionDto>>;
  delete(id: string): Observable<SingleResponseDto<void>>;
}
