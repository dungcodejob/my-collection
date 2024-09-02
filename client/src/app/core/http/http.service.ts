import { HttpClient, HttpContext, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { EnvConfig, OnInitConfig } from "@core/config";
import { Observable, map, pipe } from "rxjs";
import { ResponseDto } from "./response.dto";
import { ServerSideError } from "./server-side.error";

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

  get<T>(url: string, options?: Partial<HttpOptions>): Observable<ResponseDto<T>> {
    const mergedOptions = this._mergeOptions(options);
    return this.http
      .get<ResponseDto<T>>(this.baseUrl + url, mergedOptions)
      .pipe(this._handleResponse());
  }

  put<T, K = unknown>(
    url: string,
    body: K,
    options?: Partial<HttpOptions>
  ): Observable<ResponseDto<T>> {
    const mergedOptions = this._mergeOptions(options);
    return this.http
      .put<ResponseDto<T>>(this.baseUrl + url, body, mergedOptions)
      .pipe(this._handleResponse());
  }

  post<T, K = unknown>(
    url: string,
    body: K,
    options?: Partial<HttpOptions>
  ): Observable<ResponseDto<T>> {
    const mergedOptions = this._mergeOptions(options);
    return this.http
      .post<ResponseDto<T>>(this.baseUrl + url, body, mergedOptions)
      .pipe(this._handleResponse());
  }

  delete<T>(url: string, options?: Partial<HttpOptions>): Observable<ResponseDto<T>> {
    const mergedOptions = this._mergeOptions(options);
    return this.http
      .delete<ResponseDto<T>>(this.baseUrl + url, mergedOptions)
      .pipe(this._handleResponse());
  }

  private _mergeOptions(options?: HttpOptions) {
    return {
      ...this.options,
      ...options,
    };
  }

  private _handleResponse<T>() {
    return pipe(
      map((res: ResponseDto<T>) => {
        if (res.success) {
          return res;
        } else {
          throw new ServerSideError(res.message);
        }
      })
    );
  }
}
