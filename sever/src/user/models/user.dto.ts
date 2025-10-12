import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({
    description: 'User ID',
    example: 'user-uuid',
  })
  id: string;
  @ApiProperty({
    description: 'User name',
    example: 'John Doe',
  })
  name: string;

  constructor(partial: Partial<UserDto>) {
    Object.assign(this, partial);
  }
}
