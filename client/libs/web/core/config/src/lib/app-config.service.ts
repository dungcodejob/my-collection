import { HttpClient } from "@angular/common/http";
import { computed, inject, Injectable, signal } from "@angular/core";
import { map, Observable } from "rxjs";
import { MCConfig } from "./config";

@Injectable({ providedIn: "root" })
export class AppConfigService {
  private readonly _http = inject(HttpClient);
  private readonly _configUrl = "configuration/config.json";
  private readonly _config = signal<MCConfig | null>(null);

  readonly config = computed(() => {
    const value = this._config();
    if (!value) {
      throw new Error("Config not initialized");
    }
    return value;
  });

  setConfig(config: MCConfig): void {
    this._config.set(config);
  }

  load(defaultConfig: MCConfig): Observable<MCConfig> {
    return this._http.get<MCConfig | null>(this._configUrl).pipe(
      map(config => {
        const mergedConfig = config ? { ...defaultConfig, ...config } : defaultConfig;
        this.setConfig(mergedConfig);

        return mergedConfig;
      })
    );
  }
}
