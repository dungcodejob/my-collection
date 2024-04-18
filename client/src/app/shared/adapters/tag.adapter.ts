import { TagDto, TagVM } from "@shared/models";
import { BaseAdapter } from "./base.adapter";
import { ViewModelAdapter } from "./view-model.adapter";

export class TagAdapter implements ViewModelAdapter<TagDto, TagVM> {
  private readonly _baseAdapter = new BaseAdapter();

  fromDto(dto: TagDto): TagVM;
  fromDto(dto: TagDto[]): TagVM[];
  fromDto(dto: TagDto | TagDto[]): TagVM | TagVM[] {
    if (Array.isArray(dto)) {
      return dto.map(item => this.fromDto(item));
    }
    const baseVM = this._baseAdapter.fromDto(dto);
    return {
      ...baseVM,
      title: dto.title,
    };
  }
  toDto(vm: TagVM): TagDto;
  toDto(vm: TagVM[]): TagDto[];
  toDto(vm: TagVM | TagVM[]): TagDto | TagDto[] {
    if (Array.isArray(vm)) {
      return vm.map(item => this.toDto(item));
    }
    const baseDto = this._baseAdapter.toDto(vm);
    return {
      ...baseDto,
      title: vm.title,
    };
  }
}
