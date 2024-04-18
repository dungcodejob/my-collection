import { SingleResponseDto } from "@core/http";
import { MetadataDto } from "@shared/models";
import { Observable } from "rxjs";

export interface CrawlApi {
  getMetadata(url: string): Observable<SingleResponseDto<MetadataDto>>;
}
