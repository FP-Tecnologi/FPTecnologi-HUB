import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class SuscribirDto {
  @IsEmail() @MaxLength(120)
  email!: string;

  @IsOptional() @IsString() @MaxLength(200)
  origen?: string;

  // Honeypot: un humano nunca lo llena.
  @IsOptional() @IsString() @MaxLength(200)
  website?: string;
}
