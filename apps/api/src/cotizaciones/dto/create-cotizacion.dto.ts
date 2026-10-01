import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * Solicitud pública de cotización de un servicio (formulario del detalle de cada servicio).
 * El servicio se identifica por id o por slug; `website` es honeypot anti-bots.
 */
export class CreateCotizacionDto {
  @IsOptional()
  @IsString()
  servicioId?: string;

  @IsOptional()
  @IsString()
  servicioSlug?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  clienteNombre!: string;

  @IsEmail()
  @MaxLength(120)
  clienteEmail!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  clienteTelefono?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  clienteEmpresa?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  mensaje?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  origen?: string;

  @IsOptional()
  @IsString()
  website?: string;
}
