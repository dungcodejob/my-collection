import { HttpClient, HttpContext, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { EnvConfig, OnInitConfig } from "@nx/web-shared-app-config";
import { Observable } from "rxjs";
import { ResponseDto } from "../models/response.dto";

interface HttpOptions {
  headers?: HttpHeaders | Record<string, string | string[]>;
  context?: HttpContext;
  observe?: "body";
  params?:
    | HttpParams
    | Record<string, string | number | boolean | readonly (string | number | boolean)[]>;
  reportProgress?: boolean;
  responseType?: "json";
  withCredentials?: boolean;
  transferCache?:
    | {
        includeHeaders?: string[];
      }
    | boolean;
}

@Injectable()
export class HttpService implements OnInitConfig {
  readonly http = inject(HttpClient);
  readonly headers = new HttpHeaders({ "Content-Type": "application/json" });
  readonly options = { headers: this.headers, withCredentials: true };

  baseUrl!: string;

  configure(config: EnvConfig): void {
    this.baseUrl = config.baseUrl;
  }

  get<T extends ResponseDto>(url: string, options?: Partial<HttpOptions>): Observable<T> {
    const mergedOptions = this._mergeOptions(options);
    return this.http.get<T>(this.baseUrl + url, mergedOptions);
  }

  put<T extends ResponseDto, K = unknown>(
    url: string,
    body: K,
    options?: Partial<HttpOptions>
  ): Observable<T> {
    const mergedOptions = this._mergeOptions(options);
    return this.http.put<T>(this.baseUrl + url, body, mergedOptions);
  }

  post<T extends ResponseDto, K = unknown>(
    url: string,
    body: K,
    options?: Partial<HttpOptions>
  ): Observable<T> {
    const mergedOptions = this._mergeOptions(options);
    return this.http.post<T>(this.baseUrl + url, body, mergedOptions);
  }

  delete<T extends ResponseDto>(
    url: string,
    options?: Partial<HttpOptions>
  ): Observable<T> {
    const mergedOptions = this._mergeOptions(options);
    return this.http.delete<T>(this.baseUrl + url, mergedOptions);
  }

  private _mergeOptions(options?: HttpOptions) {
    return {
      ...this.options,
      ...options,
    };
  }
}
