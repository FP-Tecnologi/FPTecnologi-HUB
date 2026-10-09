import { IsArray, IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

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

  @IsOptional() @IsBoolean()
  activo?: boolean;
}

