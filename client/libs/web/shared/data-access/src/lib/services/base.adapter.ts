import { Injectable } from "@angular/core";
import { BaseDto, BaseVM } from "../models";

@Injectable({ providedIn: "root" })
export class BaseAdapter {
  toVM(value: BaseDto): BaseVM {
    return new BaseVM({
      id: value.id,
      createAt: new Date(value.createAt),
      updateAt: new Date(value.updateAt),
    });
  }

  toDto(value: BaseVM): BaseDto {
    return new BaseDto({
      id: value.id,
      createAt: value.createAt.toString(),
      updateAt: value.updateAt.toString(),
    });
  }
}
