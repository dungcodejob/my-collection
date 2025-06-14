import { HttpClient } from "@angular/common/http";
import { Injectable, InjectionToken, inject } from "@angular/core";
import { Observable, tap } from "rxjs";
import { AppConfig } from "../models/app-config";

@Injectable({ providedIn: "root" })
export class AppConfigService {
  private readonly _http = inject(HttpClient);
  private readonly _configUrl = "configuration/config.json";

  config!: AppConfig;

  load(): Observable<AppConfig> {
    return this._http.get<AppConfig>(this._configUrl).pipe(
      tap(config => {
        this.config = config;
      })
    );
  }
}
