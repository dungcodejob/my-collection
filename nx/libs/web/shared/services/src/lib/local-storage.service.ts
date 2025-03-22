import { DestroyRef, Injectable, WritableSignal, effect, inject, signal, untracked } from "@angular/core";

type UseStorageObject<TType> = {
  get: () => TType | null;
  set: (value: TType | null) => void;
  remove: () => void;
};

@Injectable({ providedIn: "root" })
export class LocalStorageService {
  // private readonly _logService = inject(LogService);
  private readonly _localStorage!: Storage;
  private readonly _isEnabled: boolean;
  constructor() {
    if (!window.localStorage) {
      this._isEnabled = false;
      // this._logService.error("Current browser does not support Local Storage");
      return;
    }
    this._isEnabled = true;
    this._localStorage = window.localStorage;
  }

  set<TType = unknown>(key: string, value: TType): void {
    if (!this._isEnabled) {
      return;
    }

    const stringified = JSON.stringify(value);
    const storageEvent = new StorageEvent("storage", {
      key: key,
      newValue: stringified,
      storageArea: this._localStorage,
    });

    window.dispatchEvent(storageEvent);

    this._localStorage.setItem(key, stringified);
  }

  get<TType = unknown>(key: string): TType | null {
    if (!this._isEnabled) {
      return null;
    }

    const json = this._localStorage.getItem(key);
    if (!json) {
      return null;
    }

    return JSON.parse(json);
  }

  use<TType = unknown>(key: string): UseStorageObject<TType> {
    return {
      get: () => this.get<TType>(key),
      set: (value: TType | null) => this.set(key, value),
      remove: () => this.remove(key),
    };
  }

  form = <TValue>(key: string): WritableSignal<TValue | null> => {
    const initialValue = this.get<TValue>(key);

    const $value = signal<TValue | null>(initialValue);

    const writeToStorageOnUpdateEffect = effect(() => {
      const updated = $value();
      untracked(() => {
        this.set(key, updated);
      });
    });

    const storageEventListener = (event: StorageEvent) => {
      const isWatchedValueTargeted = event.key === key;
      if (!isWatchedValueTargeted) {
        return;
      }

      const currentValue = $value();
      const newValue = this.get<TValue>(key);

      const hasValueChanged = currentValue !== newValue;

      if (hasValueChanged) {
        $value.set(newValue);
      }
    };

    window.addEventListener("storage", storageEventListener);

    inject(DestroyRef).onDestroy(() => {
      writeToStorageOnUpdateEffect.destroy();
      window.removeEventListener("storage", storageEventListener);
    });

    return $value;
  };

  remove(key: string): void {
    if (!this._isEnabled) {
      return;
    }
    this._localStorage.removeItem(key);
  }

  clear(): void {
    this._localStorage.clear();
  }
}
