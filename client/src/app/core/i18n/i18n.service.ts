import { DestroyRef, Injectable, inject } from "@angular/core";

import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { EnvConfig, OnInitConfig } from "@core/config";
import { TranslocoService } from "@ngneat/transloco";
import { LANGUAGES } from "@shared/constants";
import { LocalStorageKeys } from "@shared/enums";
import { LocalStorageService } from "@shared/services/local-storage.service";
import { tap } from "rxjs";
import { Language } from "./language";
@Injectable({ providedIn: "root" })
export class I18nService implements OnInitConfig {
  private readonly _translocoService = inject(TranslocoService);
  private readonly _localService = inject(LocalStorageService);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _availableLanguages = LANGUAGES;

  lang$ = this._translocoService.langChanges$;

  configure(config: EnvConfig): void {
    const defaultLang = config.defaultLanguage ?? "en";
    this._translocoService.setDefaultLang(defaultLang);
    this._translocoService.setActiveLang(defaultLang);
    this._asyncLangToLocal();
  }

  getAvailableLangs(): Language[] {
    return this._availableLanguages;
  }

  getDefaultLang(): string {
    return this._translocoService.getDefaultLang();
  }

  getActiveLang(): string {
    return this._translocoService.getActiveLang();
  }

  setLang(language: string): void {
    this._translocoService.setActiveLang(language);
  }

  private _asyncLangToLocal() {
    this.lang$
      .pipe(
        tap(lang => this._localService.set(LocalStorageKeys.Lang, lang)),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe();
  }
}
