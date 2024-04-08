import { CollectionDto, CollectionVM } from "@shared/models";
import { BaseAdapter } from "./base.adapter";
import { ViewModelAdapter } from "./view-model.adapter";

export class CollectionAdapter implements ViewModelAdapter<CollectionDto, CollectionVM> {
  private readonly _baseAdapter = new BaseAdapter();

  fromDto(dto: CollectionDto): CollectionVM;
  fromDto(dto: CollectionDto[]): CollectionVM[];
  fromDto(dto: CollectionDto | CollectionDto[]): CollectionVM | CollectionVM[] {
    if (Array.isArray(dto)) {
      return dto.map(item => this.fromDto(item));
    }
    const baseVM = this._baseAdapter.fromDto(dto);
    return {
      ...baseVM,
      icon: dto.icon,
      title: dto.title,
      position: dto.position,
    };
  }
  toDto(vm: CollectionVM): CollectionDto;
  toDto(vm: CollectionVM[]): CollectionDto[];
  toDto(vm: CollectionVM | CollectionVM[]): CollectionDto | CollectionDto[] {
    if (Array.isArray(vm)) {
      return vm.map(item => this.toDto(item));
    }
    const baseDto = this._baseAdapter.toDto(vm);
    return {
      ...baseDto,
      icon: vm.icon,
      title: vm.title,
      position: vm.position,
    };
  }
}
