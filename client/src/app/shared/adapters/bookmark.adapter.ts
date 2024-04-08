import { BookmarkDto, BookmarkVM } from "@shared/models";
import { BaseAdapter } from "./base.adapter";
import { ViewModelAdapter } from "./view-model.adapter";

export class BookmarkAdapter implements ViewModelAdapter<BookmarkDto, BookmarkVM> {
  private readonly _baseAdapter = new BaseAdapter();

  fromDto(dto: BookmarkDto): BookmarkVM;
  fromDto(dto: BookmarkDto[]): BookmarkVM[];
  fromDto(dto: BookmarkDto | BookmarkDto[]): BookmarkVM | BookmarkVM[] {
    if (Array.isArray(dto)) {
      return dto.map(item => this.fromDto(item));
    }
    const base = this._baseAdapter.fromDto(dto);
    return {
      ...base,
      url: dto.url,
      title: dto.title,
      domain: dto.domain,
      image: dto.image,
      description: dto.description,
      favicon: dto.favicon,
      note: dto.note,
      collectionId: dto.collectionId,
    };
  }
  toDto(vm: BookmarkVM): BookmarkDto;
  toDto(vm: BookmarkVM[]): BookmarkDto[];
  toDto(vm: BookmarkVM | BookmarkVM[]): BookmarkDto | BookmarkDto[] {
    if (Array.isArray(vm)) {
      return vm.map(item => this.toDto(item));
    }
    const base = this._baseAdapter.toDto(vm);
    return {
      ...base,
      url: vm.url,
      title: vm.title,
      domain: vm.domain,
      image: vm.image,
      description: vm.description,
      favicon: vm.favicon,
      note: vm.note,
      collectionId: vm.collectionId,
    };
  }
}
