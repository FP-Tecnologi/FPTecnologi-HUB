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

  @IsOptional()
  @IsString()
  @MaxLength(20)
  dni?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  telefono?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  cargo?: string;

  // Foto de perfil. Por ahora acepta una URL o un data: URI (subida en el
  // navegador con FileReader, sin backend de storage todavía) -- el límite
  // de tamaño real lo impone el frontend antes de mandarlo.
  // ponytail: base64-en-columna-de-texto, subir a un bucket real (Supabase
  // Storage / S3) si algún día los avatares necesitan ser más grandes o
  // servirse con CDN/caché propios.
  @IsOptional()
  @IsString()
  @MaxLength(400_000)
  avatarUrl?: string;
}
