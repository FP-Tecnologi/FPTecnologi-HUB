import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Edición del propio perfil (`PATCH /usuarios/me`). Todo opcional, pero al
 * menos un campo debe venir. Cambiar el correo exige confirmar la contraseña
 * actual (es la identidad de login) — la verificación del correo nuevo por
 * código queda como mejora futura.
 */
export class UpdatePerfilDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @IsOptional()
  @IsString()
  currentPassword?: string;
}
