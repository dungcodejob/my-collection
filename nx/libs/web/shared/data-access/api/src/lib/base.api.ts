import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject } from "@angular/core";
import { injectAppConfig } from "@nx/web-shared-app-config";

export class BaseApi {
  protected readonly _config = injectAppConfig();
  protected readonly _http = inject(HttpClient);
  protected readonly _headers = new HttpHeaders({ "Content-Type": "application/json" });
  protected readonly _options = { headers: this._headers, withCredentials: true };

  private _mergeOptions(options?: object) {
    return {
      ...this._options,
      ...options,
    };
  }
}
