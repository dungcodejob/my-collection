import { inject, Injectable } from "@angular/core";
import { CollectionDto, CollectionVM } from "@nx/web-shared-models";
import { BaseAdapter } from "./base.adapter";

@Injectable({ providedIn: "root" })
export class CollectionAdapter {
  private readonly _baseAdapter = inject(BaseAdapter);

  toItemVM(value: CollectionDto): CollectionVM;
  toItemVM(value: CollectionDto[]): CollectionVM[];
  toItemVM(value: CollectionDto | CollectionDto[]): CollectionVM | CollectionVM[] {
    if (Array.isArray(value)) {
      return value.map(item => this.toItemVM(item));
    }
    const base = this._baseAdapter.toVM(value);
    return new CollectionVM({
      ...base,
      icon: value.icon,
      title: value.title,
      position: value.position,
    });
  }

  toItemDto(value: CollectionVM): CollectionDto;
  toItemDto(value: CollectionVM[]): CollectionDto[];
  toItemDto(value: CollectionVM | CollectionVM[]): CollectionDto | CollectionDto[] {
    if (Array.isArray(value)) {
      return value.map(item => this.toItemDto(item));
    }
    const base = this._baseAdapter.toDto(value);
    return new CollectionDto({
      ...base,
      icon: value.icon,
      title: value.title,
      position: value.position,
    });
  }
}
