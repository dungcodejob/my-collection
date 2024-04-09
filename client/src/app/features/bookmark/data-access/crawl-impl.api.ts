import { HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { HttpService, SingleResponseDto, SingleResult } from "@core/http";
import { MetadataDto } from "@shared/models";
import { Observable } from "rxjs";
import { CrawlApi } from "./crawl.api";

@Injectable()
export class CrawlImplApi implements CrawlApi {
  private readonly _http = inject(HttpService);

  getMetadata(url: string): Observable<SingleResponseDto<MetadataDto>> {
    let params = new HttpParams();
    params = params.set("url", url);

    return this._http.get<SingleResult<MetadataDto>>("/crawl/metadata", { params });
  }
}
