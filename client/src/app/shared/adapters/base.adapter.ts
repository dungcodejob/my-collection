import { BaseDto, BaseVM } from "@shared/models";
import { ViewModelAdapter } from "./view-model.adapter";

export class BaseAdapter implements ViewModelAdapter<BaseDto, BaseVM> {
  fromEntityDto(dto: BaseDto): BaseVM;
  fromEntityDto(dto: BaseDto[]): BaseVM[];
  fromEntityDto(dto: BaseDto | BaseDto[]): BaseVM | BaseVM[] {
    if (Array.isArray(dto)) {
      return dto.map(item => this.fromEntityDto(item));
    }

    return {
      id: dto.id,
      createAt: new Date(dto.createAt),
      updateAt: new Date(dto.updateAt),
    };
  }

  toEntityDto(vm: BaseVM): BaseDto;
  toEntityDto(vm: BaseVM[]): BaseDto[];
  toEntityDto(vm: BaseVM | BaseVM[]): BaseDto | BaseDto[] {
    if (Array.isArray(vm)) {
      return vm.map(item => this.toEntityDto(item));
    }

    return {
      id: vm.id,
      createAt: vm.createAt.toISOString(),
      updateAt: vm.updateAt.toISOString(),
    };
  }
}
