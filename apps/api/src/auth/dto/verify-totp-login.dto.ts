import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class VerifyTotpLoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsOptional()
  @IsBoolean()
  trustDevice?: boolean;
}
