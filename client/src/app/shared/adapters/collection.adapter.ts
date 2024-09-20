import { CollectionDto, CollectionVM } from "@shared/models";
import { BaseAdapter } from "./base.adapter";
import { ViewModelAdapter } from "./view-model.adapter";

export class CollectionAdapter implements ViewModelAdapter<CollectionDto, CollectionVM> {
  private readonly _baseAdapter = new BaseAdapter();

  fromEntityDto(dto: CollectionDto): CollectionVM;
  fromEntityDto(dto: CollectionDto[]): CollectionVM[];
  fromEntityDto(dto: CollectionDto | CollectionDto[]): CollectionVM | CollectionVM[] {
    if (Array.isArray(dto)) {
      return dto.map(item => this.fromEntityDto(item));
    }
    const baseVM = this._baseAdapter.fromEntityDto(dto);
    return {
      ...baseVM,
      icon: dto.icon,
      title: dto.title,
      position: dto.position,
    };
  }
  toEntityDto(vm: CollectionVM): CollectionDto;
  toEntityDto(vm: CollectionVM[]): CollectionDto[];
  toEntityDto(vm: CollectionVM | CollectionVM[]): CollectionDto | CollectionDto[] {
    if (Array.isArray(vm)) {
      return vm.map(item => this.toEntityDto(item));
    }
    const baseDto = this._baseAdapter.toEntityDto(vm);
    return {
      ...baseDto,
      icon: vm.icon,
      title: vm.title,
      position: vm.position,
    };
  }
}
