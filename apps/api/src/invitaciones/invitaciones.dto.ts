import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CrearInvitacionDto {
  @IsEmail()
  email!: string;

  @IsString()
  rolId!: string;
}

export class AceptarInvitacionDto {
  @IsString()
  token!: string;

  // Solo para cuentas nuevas; si el correo ya tiene cuenta se ignora.
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @IsOptional()
  @IsString()
  nombre?: string;
}
