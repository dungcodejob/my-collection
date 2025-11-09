import { HttpClient, HttpContext, HttpHeaders, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { MCConfig, OnInitConfig } from "@client/web-core-config";
import { Observable } from "rxjs";
import { ResponseDto } from "../models";

type HttpOptions = {
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
};

@Injectable({
  providedIn: "root",
})
export class HttpService implements OnInitConfig {
  protected readonly _http = inject(HttpClient);
  protected readonly _headers = new HttpHeaders({ "Content-Type": "application/json" });
  protected readonly _options = { headers: this._headers, withCredentials: true };
  protected _baseUrl!: string;

  configure(config: MCConfig): void {
    console.log(config);
    this._baseUrl = config.apiBaseUrl;
  }

  get<T extends ResponseDto>(url: string, options?: Partial<HttpOptions>): Observable<T> {
    const mergedOptions = this._mergeOptions(options);
    return this._http.get<T>(this._baseUrl + url, mergedOptions);
  }

  put<T extends ResponseDto, K = unknown>(
    url: string,
    body: K,
    options?: Partial<HttpOptions>
  ): Observable<T> {
    const mergedOptions = this._mergeOptions(options);
    return this._http.put<T>(this._baseUrl + url, body, mergedOptions);
  }

  post<T extends ResponseDto, K = unknown>(
    url: string,
    body: K,
    options?: Partial<HttpOptions>
  ): Observable<T> {
    const mergedOptions = this._mergeOptions(options);
    return this._http.post<T>(this._baseUrl + url, body, mergedOptions);
  }

  delete<T extends ResponseDto>(
    url: string,
    options?: Partial<HttpOptions>
  ): Observable<T> {
    const mergedOptions = this._mergeOptions(options);
    return this._http.delete<T>(this._baseUrl + url, mergedOptions);
  }

  private _mergeOptions(options?: HttpOptions): HttpOptions {
    return {
      ...this._options,
      ...options,
    };
  }
}
