import { HttpClient } from "@angular/common/http";
import { Injectable, Provider, inject, isDevMode } from "@angular/core";
import { provideAppInitWithConfig } from "@core/config";
import { Translation, TranslocoLoader, provideTransloco } from "@ngneat/transloco";
import { I18nService } from "./i18n.service";

@Injectable({ providedIn: "root" })
export class TranslocoHttpLoader implements TranslocoLoader {
  private http = inject(HttpClient);

  getTranslation(lang: string) {
    return this.http.get<Translation>(`/assets/i18n/${lang}.json`);
  }
}

export const provideI18n = (): Provider[] => [
  provideTransloco({
    config: {
      // Remove this option if your application doesn't support changing language in runtime.
      reRenderOnLangChange: true,
      prodMode: !isDevMode(),
    },
    loader: TranslocoHttpLoader,
  }),
  provideAppInitWithConfig(I18nService),
];
