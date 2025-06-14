import {
  DestroyRef,
  Injectable,
  InjectionToken,
  WritableSignal,
  effect,
  inject,
  signal,
  untracked,
} from "@angular/core";

export const BROWSER_STORAGE_TOKEN = new InjectionToken<Storage>("BROTHER_STORAGE", {
  providedIn: "root",
  factory: (): Storage => localStorage,
});

type UseStorageObject<TType> = {
  get: () => TType | null;
  set: (value: TType | null) => void;
  remove: () => void;
};

@Injectable({
  providedIn: "root",
})
export class StorageService {
  private readonly _prefix = "app-client";
  private readonly _storage = inject(BROWSER_STORAGE_TOKEN);
  private readonly _isEnabled = this._storage !== null;

  set<TType = unknown>(key: string, value: TType): void {
    if (!this._isEnabled) {
      return;
    }

    const appKey = this.buildAppKey(key);

    const stringified = JSON.stringify(value);
    const storageEvent = new StorageEvent("storage", {
      key: appKey,
      newValue: stringified,
      storageArea: this._storage,
    });

    window.dispatchEvent(storageEvent);

    this._storage.setItem(appKey, stringified);
  }

  get<TType = unknown>(key: string): TType | null {
    if (!this._isEnabled) {
      return null;
    }
    const appKey = this.buildAppKey(key);
    const json = this._storage.getItem(appKey);
    if (!json) {
      return null;
    }

    return JSON.parse(json);
  }

  remove(key: string): void {
    if (!this._isEnabled) {
      return;
    }

    const appKey = this.buildAppKey(key);
    this._storage.removeItem(appKey);
  }

  clear(): void {
    this._storage.clear();
  }

  use<TType = unknown>(key: string): UseStorageObject<TType> {
    return {
      get: () => this.get<TType>(key),
      set: (value: TType | null) => this.set(key, value),
      remove: () => this.remove(key),
    };
  }

  form = <TValue>(
    key: string,
    initialValue: TValue | null = null
  ): WritableSignal<TValue | null> => {
    const storedValue = this.get<TValue>(key);

    const $value = signal<TValue | null>(storedValue ?? initialValue);

    const writeToStorageOnUpdateEffect = effect(() => {
      const updated = $value();
      untracked(() => {
        this.set(key, updated);
      });
    });

    const storageEventListener = (event: StorageEvent): void => {
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

  private buildAppKey(key: string): string {
    return `${this._prefix}-${key}`;
  }
}
