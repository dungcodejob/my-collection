import { JwtToken } from '@authentication/models';
import { UserProfileDto } from '@modules/user';

export class AuthResultDto {
  tokens: JwtToken;
  user: UserProfileDto;
}
