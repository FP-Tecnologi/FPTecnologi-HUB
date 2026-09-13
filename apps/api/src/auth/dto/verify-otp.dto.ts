import { IsBoolean, IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Length(6, 6)
  codigo!: string;

  @IsOptional()
  @IsBoolean()
  trustDevice?: boolean;
}
