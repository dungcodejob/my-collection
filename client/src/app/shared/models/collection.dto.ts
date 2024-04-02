import { BaseDto } from "./base.dto";

export interface CollectionDto extends BaseDto {
  readonly title: string;
  readonly icon: string;
}
