import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from './user.dto';

export class AuthResultDto {
  @ApiProperty()
  user: UserDto;
  @ApiProperty()
  accessToken: string;
  @ApiProperty()
  refreshToken: string;
}
