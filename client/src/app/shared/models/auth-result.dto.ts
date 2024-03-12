import { TokenDto } from "./token.dto";
import { UserProfileDto } from "./user-profile.dto";

export interface AuthResultDto {
  user: UserProfileDto;
  tokens: TokenDto;
}
