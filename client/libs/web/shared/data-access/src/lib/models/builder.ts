export abstract class Builder<T> {
  private _intermediate: Partial<T> = {};

  constructor() {
    this.reset();
  }

  with<K extends keyof T>(property: K, value: T[K]): Builder<T> {
    this._intermediate[property] = value;
    return this;
  }

  build(): T {
    const p: Partial<T> = {};
    for (const key in this._intermediate) {
      p[key] = this._intermediate[key];
    }
    this.reset();

    return p as T;
  }

  private reset(): void {
    this._intermediate = { ...this.setDefaults() };
  }

  abstract setDefaults(): Partial<T>;
}
