import { IsArray, IsBoolean, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ESTILOS, VISTAS, type EstiloTarjeta, type VistaTarjeta } from './tarjetas.modelo.js';

/** Campos de la tarjeta; el servicio vuelve a validar URLs, slug y enlaces. */
export class GuardarTarjetaDto {
  @IsString() @MinLength(2) @MaxLength(100)
  nombre!: string;

  @IsOptional() @IsString() @MaxLength(60)
  slug?: string;

  @IsOptional() @IsString() @MaxLength(100)
  cargo?: string;

  @IsOptional() @IsString() @MaxLength(100)
  area?: string;

  @IsOptional() @IsString() @MaxLength(400)
  bio?: string;

  @IsOptional() @IsString() @MaxLength(500)
  fotoUrl?: string;

  @IsOptional() @IsString() @MaxLength(30)
  telefono?: string;

  @IsOptional() @IsString() @MaxLength(30)
  whatsapp?: string;

  @IsOptional() @IsString() @MaxLength(120)
  email?: string;

  @IsOptional() @IsString() @MaxLength(500)
  linkedin?: string;

  @IsOptional() @IsString() @MaxLength(500)
  web?: string;

  @IsOptional() @IsString() @MaxLength(500)
  agendaUrl?: string;

  @IsOptional() @IsArray()
  enlaces?: unknown[];

  @IsOptional() @IsIn(ESTILOS)
  estilo?: EstiloTarjeta;

  @IsOptional() @IsIn(VISTAS)
  vista?: VistaTarjeta;

  @IsOptional() @IsBoolean()
  activo?: boolean;
}

export class ActivarTarjetaDto {
  @IsBoolean()
  activo!: boolean;
}

