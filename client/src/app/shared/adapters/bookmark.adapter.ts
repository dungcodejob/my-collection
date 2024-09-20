import { BookmarkDto, BookmarkVM } from "@shared/models";
import { BaseAdapter } from "./base.adapter";
import { CollectionAdapter } from "./collection.adapter";
import { TagAdapter } from "./tag.adapter";
import { ViewModelAdapter } from "./view-model.adapter";

export class BookmarkAdapter implements ViewModelAdapter<BookmarkDto, BookmarkVM> {
  private readonly _baseAdapter = new BaseAdapter();
  private readonly _tagAdapter = new TagAdapter();
  private readonly _collectionAdapter = new CollectionAdapter();

  fromEntityDto(dto: BookmarkDto): BookmarkVM;
  fromEntityDto(dto: BookmarkDto[]): BookmarkVM[];
  fromEntityDto(dto: BookmarkDto | BookmarkDto[]): BookmarkVM | BookmarkVM[] {
    if (Array.isArray(dto)) {
      return dto.map(item => this.fromEntityDto(item));
    }
    const base = this._baseAdapter.fromEntityDto(dto);

    return {
      ...base,
      url: dto.url,
      title: dto.title,
      domain: dto.domain,
      image: dto.image,
      description: dto.description,
      favicon: dto.favicon,
      note: dto.note,
      collection: this._collectionAdapter.fromEntityDto(dto.collection),
      tags: this._tagAdapter.fromEntityDto(dto.tags),
    };
  }
  toEntityDto(vm: BookmarkVM): BookmarkDto;
  toEntityDto(vm: BookmarkVM[]): BookmarkDto[];
  toEntityDto(vm: BookmarkVM | BookmarkVM[]): BookmarkDto | BookmarkDto[] {
    if (Array.isArray(vm)) {
      return vm.map(item => this.toEntityDto(item));
    }
    const base = this._baseAdapter.toEntityDto(vm);
    return {
      ...base,
      url: vm.url,
      title: vm.title,
      domain: vm.domain,
      image: vm.image,
      description: vm.description,
      favicon: vm.favicon,
      note: vm.note,
      collection: this._collectionAdapter.toEntityDto(vm.collection),
      tags: this._tagAdapter.toEntityDto(vm.tags),
    };
  }
}
