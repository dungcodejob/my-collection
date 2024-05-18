import { ListResponseDto, SingleResponseDto } from "@core/http";
import {
  CollectionVM,
  CreateCollectionDto,
  MoveCollectionDto,
  UpdateCollectionDto,
} from "@shared/models";
import { Observable } from "rxjs";

export interface CollectionApi {
  findAll(): Observable<ListResponseDto<CollectionVM>>;
  move(id: string, body: MoveCollectionDto): Observable<SingleResponseDto<CollectionVM>>;
  create(body: CreateCollectionDto): Observable<SingleResponseDto<CollectionVM>>;
  update(
    id: string,
    body: UpdateCollectionDto
  ): Observable<SingleResponseDto<CollectionVM>>;
  delete(id: string): Observable<SingleResponseDto<void>>;
}
