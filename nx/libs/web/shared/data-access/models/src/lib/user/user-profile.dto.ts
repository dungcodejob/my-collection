import { BaseDto } from "../generic/base.dto";

export interface UserProfileDto extends BaseDto {
  email: string;
  firstName: string;
  lastName: string;
}
