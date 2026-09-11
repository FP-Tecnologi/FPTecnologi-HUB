import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class VerifyTotpLoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;
}
