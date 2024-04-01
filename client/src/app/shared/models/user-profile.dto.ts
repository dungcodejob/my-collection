import { BaseDto } from "./base.dto";

export interface UserProfileDto extends BaseDto {
  email: string;
  firstName: string;
  lastName: string;
}
