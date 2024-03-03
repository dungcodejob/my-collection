import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, tap } from "rxjs";
import { EnvConfig } from "./env-config";

@Injectable({ providedIn: "root" })
export class ConfigService {
  private readonly _http = inject(HttpClient);
  private readonly _configUrl = "configuration/config.json";

  config!: EnvConfig;

  load(): Observable<EnvConfig> {
    return this._http.get<EnvConfig>(this._configUrl).pipe(
      tap(config => {
        this.config = config;
      })
    );
  }
}
