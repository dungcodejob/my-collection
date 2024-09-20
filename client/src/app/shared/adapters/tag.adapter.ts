import { TagDto, TagVM } from "@shared/models";
import { BaseAdapter } from "./base.adapter";
import { ViewModelAdapter } from "./view-model.adapter";

export class TagAdapter implements ViewModelAdapter<TagDto, TagVM> {
  private readonly _baseAdapter = new BaseAdapter();

  fromEntityDto(dto: TagDto): TagVM;
  fromEntityDto(dto: TagDto[]): TagVM[];
  fromEntityDto(dto: TagDto | TagDto[]): TagVM | TagVM[] {
    if (Array.isArray(dto)) {
      return dto.map(item => this.fromEntityDto(item));
    }
    const baseVM = this._baseAdapter.fromEntityDto(dto);
    return {
      ...baseVM,
      title: dto.title,
      collectionId: dto.collectionId,
    };
  }
  toEntityDto(vm: TagVM): TagDto;
  toEntityDto(vm: TagVM[]): TagDto[];
  toEntityDto(vm: TagVM | TagVM[]): TagDto | TagDto[] {
    if (Array.isArray(vm)) {
      return vm.map(item => this.toEntityDto(item));
    }
    const baseDto = this._baseAdapter.toEntityDto(vm);
    return {
      ...baseDto,
      title: vm.title,
      collectionId: vm.collectionId,
    };
  }
}
