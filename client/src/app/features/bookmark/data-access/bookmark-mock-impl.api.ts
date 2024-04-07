/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from "@angular/core";
import { PaginationResult, ResponseDto, SingleResult } from "@core/http";
import {
  BookmarkDto,
  BookmarkQueryDto,
  BookmarkRequiredProps,
  CollectionDto,
  UpdateBookmarkDto,
} from "@shared/models";
import { Observable } from "rxjs";
import { BookmarkApi } from "./bookmark.api";

@Injectable()
export class BookmarkDtoMockImplApi implements BookmarkApi {
  private _baseResponse: Omit<ResponseDto, "result"> = {
    statusCode: 200,
    success: true,
    message: "Fake success message",
    timestamp: new Date().toISOString(),
    url: "https://example.com/api",
    method: "POST",
  };

  private collections: CollectionDto[] = [];
  constructor() {
    // Initialize mock data
    for (let i = 1; i <= 5; i++) {
      this.collections.push({
        id: i.toString(),
        title: `Collection ${i}`,
        icon: `icon-${i}`,
        position: `position-${i}`,
        updateAt: new Date(),
        createAt: new Date(),
      });
    }
  }
  findAll(query: BookmarkQueryDto): Observable<
    Readonly<{
      statusCode: number;
      success: boolean;
      message: string;
      description?: string | undefined;
      result: Readonly<PaginationResult<BookmarkDto>>;
      timestamp: string;
      url: string;
      method: string;
    }>
  > {
    throw new Error("Method not implemented.");
  }

  create(body: BookmarkRequiredProps): Observable<
    Readonly<{
      statusCode: number;
      success: boolean;
      message: string;
      description?: string | undefined;
      result: Readonly<SingleResult<BookmarkDto>>;
      timestamp: string;
      url: string;
      method: string;
    }>
  > {
    throw new Error("Method not implemented.");
  }
  update(
    id: string,
    body: UpdateBookmarkDto
  ): Observable<
    Readonly<{
      statusCode: number;
      success: boolean;
      message: string;
      description?: string | undefined;
      result: Readonly<SingleResult<BookmarkDto>>;
      timestamp: string;
      url: string;
      method: string;
    }>
  > {
    throw new Error("Method not implemented.");
  }
  delete(id: string): Observable<
    Readonly<{
      statusCode: number;
      success: boolean;
      message: string;
      description?: string | undefined;
      result: Readonly<SingleResult<void>>;
      timestamp: string;
      url: string;
      method: string;
    }>
  > {
    throw new Error("Method not implemented.");
  }
}
