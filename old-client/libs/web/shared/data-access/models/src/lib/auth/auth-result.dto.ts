import { UserProfileDto } from "../user/user-profile.dto";
import { TokenDto } from "./token.dto";

export interface AuthResultDto {
  user: UserProfileDto;
  tokens: TokenDto;
}
