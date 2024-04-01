import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class LoginBodyDto {
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(18)
  username!: string;

  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(20)
  password!: string;
}
