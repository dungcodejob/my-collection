import { UserDto } from '@app/user';
import { ApiProperty } from '@nestjs/swagger';

export class AuthResultDto {
  @ApiProperty({
    description: 'User information',
    type: () => UserDto,
  })
  user: UserDto;

  @ApiProperty({
    description: 'JWT access token for API authentication',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InNlc3Npb24taWQiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJpYXQiOjE2NDA5OTUyMDAsImV4cCI6MTY0MDk5ODgwMH0.signature',
  })
  accessToken: string;

  @ApiProperty({
    description:
      'JWT refresh token for obtaining new access tokens (stored in HTTP-only cookie)',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InNlc3Npb24taWQiLCJ0b2tlbklkIjoidG9rZW4taWQiLCJ2ZXJzaW9uIjowLCJpYXQiOjE2NDA5OTUyMDAsImV4cCI6MTY0MTYwMDAwMH0.signature',
  })
  refreshToken: string;
}
