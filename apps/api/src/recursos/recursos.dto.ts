import { IsBoolean, IsEmail, IsIn, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength } from 'class-validator';

const TEXTO = /^[^<>]*$/;
export const TIPOS_RECURSO = ['IMAGEN', 'PDF', 'VIDEO', 'DOCUMENTO', 'OTRO'] as const;
export const ESTADOS_SOCIO = ['PENDIENTE', 'ACTIVO', 'SUSPENDIDO', 'RECHAZADO'] as const;

export class CrearRecursoDto {
  @IsString() @MinLength(2) @MaxLength(160) @Matches(TEXTO)
  titulo!: string;

  @IsOptional() @IsString() @MaxLength(1000) @Matches(TEXTO)
  descripcion?: string;

  @IsIn(TIPOS_RECURSO)
  tipo!: (typeof TIPOS_RECURSO)[number];

  @IsOptional() @IsString() @MaxLength(80) @Matches(TEXTO)
  fabricante?: string;

  @IsOptional() @IsString() @MaxLength(80) @Matches(TEXTO)
  categoria?: string;

  // Clave devuelta por POST /recursos/archivo (se revisa en el servicio).
  @IsString() @MaxLength(200)
  clave!: string;

  @IsOptional() @IsString() @MaxLength(120)
  mime?: string;

  @IsOptional() @IsInt() @Min(0) @Max(2_000_000_000)
  bytes?: number;

  @IsOptional() @IsBoolean()
  visible?: boolean;

  @IsOptional() @IsInt() @Min(0) @Max(9999)
  orden?: number;
}

export class ActualizarRecursoDto {
  @IsOptional() @IsString() @MinLength(2) @MaxLength(160) @Matches(TEXTO)
  titulo?: string;

  @IsOptional() @IsString() @MaxLength(1000) @Matches(TEXTO)
  descripcion?: string;

  @IsOptional() @IsString() @MaxLength(80) @Matches(TEXTO)
  fabricante?: string;

  @IsOptional() @IsString() @MaxLength(80) @Matches(TEXTO)
  categoria?: string;

  @IsOptional() @IsBoolean()
  visible?: boolean;

  @IsOptional() @IsInt() @Min(0) @Max(9999)
  orden?: number;
}

/** Alta de un socio por el equipo (queda ACTIVO de inmediato). */
export class CrearSocioDto {
  @IsEmail() @MaxLength(120)
  email!: string;

  @IsOptional() @IsString() @MaxLength(120) @Matches(TEXTO)
  nombre?: string;

  @IsOptional() @IsString() @MaxLength(120) @Matches(TEXTO)
  empresa?: string;

  @IsOptional() @IsString() @MaxLength(15) @Matches(/^[0-9A-Za-z-]*$/)
  ruc?: string;
}

export class ActualizarSocioDto {
  @IsOptional() @IsString() @MaxLength(120) @Matches(TEXTO)
  nombre?: string;

  @IsOptional() @IsString() @MaxLength(120) @Matches(TEXTO)
  empresa?: string;

  @IsOptional() @IsString() @MaxLength(15) @Matches(/^[0-9A-Za-z-]*$/)
  ruc?: string;

  @IsOptional() @IsString() @MaxLength(2000) @Matches(TEXTO)
  notas?: string;

  @IsOptional() @IsIn(ESTADOS_SOCIO)
  estado?: (typeof ESTADOS_SOCIO)[number];
}

/** Registro público de una empresa que quiere ser socia: queda PENDIENTE hasta que el equipo la apruebe. */
export class RegistroSocioDto {
  @IsString() @MinLength(2) @MaxLength(160) @Matches(TEXTO)
  empresa!: string;

  @IsString() @Matches(/^(10|15|16|17|20)\d{9}$/, { message: 'El RUC debe tener 11 dígitos' })
  ruc!: string;

  @IsString() @MinLength(2) @MaxLength(120) @Matches(TEXTO)
  nombre!: string;

  @IsOptional() @IsString() @MaxLength(80) @Matches(TEXTO)
  cargo?: string;

  @IsEmail() @MaxLength(120)
  email!: string;

  @IsOptional() @IsString() @MaxLength(20)
  celular?: string;

  @IsOptional() @IsString() @MaxLength(1000) @Matches(TEXTO)
  mensaje?: string;

  // Honeypot: un humano nunca lo llena.
  @IsOptional() @IsString() @MaxLength(200)
  website?: string;
}
