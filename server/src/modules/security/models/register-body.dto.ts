import { IsEmail, IsNotEmpty } from 'class-validator';
import { LoginBodyDto } from './login-body.dto';

export class RegisterBodyDto extends LoginBodyDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;
}
