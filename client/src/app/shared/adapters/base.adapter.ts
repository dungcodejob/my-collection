import { BaseDto, BaseVM } from "@shared/models";
import { ViewModelAdapter } from "./view-model.adapter";

export class BaseAdapter implements ViewModelAdapter<BaseDto, BaseVM> {
  fromDto(dto: BaseDto): BaseVM;
  fromDto(dto: BaseDto[]): BaseVM[];
  fromDto(dto: BaseDto | BaseDto[]): BaseVM | BaseVM[] {
    if (Array.isArray(dto)) {
      return dto.map(item => this.fromDto(item));
    }

    return {
      id: dto.id,
      createAt: new Date(dto.createAt),
      updateAt: new Date(dto.updateAt),
    };
  }

  toDto(vm: BaseVM): BaseDto;
  toDto(vm: BaseVM[]): BaseDto[];
  toDto(vm: BaseVM | BaseVM[]): BaseDto | BaseDto[] {
    if (Array.isArray(vm)) {
      return vm.map(item => this.toDto(item));
    }

    return {
      id: vm.id,
      createAt: vm.createAt.toISOString(),
      updateAt: vm.updateAt.toISOString(),
    };
  }
}
