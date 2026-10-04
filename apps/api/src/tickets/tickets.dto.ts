import { ArrayMaxSize, IsArray, IsBoolean, IsEmail, IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

const TEXTO = /^[^<>]*$/; // sin etiquetas: se muestran en el dashboard y en correos

export const TIPOS_TICKET = ['RECLAMO', 'VERIFICACION', 'SOPORTE'] as const;
export const ESTADOS_TICKET = ['NUEVO', 'EN_REVISION', 'RESUELTO', 'CERRADO'] as const;

export class CrearTicketDto {
  @IsIn(TIPOS_TICKET)
  tipo!: (typeof TIPOS_TICKET)[number];

  @IsOptional() @IsBoolean()
  esEmpresa?: boolean;

  @IsOptional() @IsString() @MaxLength(15) @Matches(/^[0-9A-Za-z-]*$/)
  documento?: string;

  @IsString() @MinLength(2) @MaxLength(160) @Matches(TEXTO)
  nombre!: string;

  @IsEmail() @MaxLength(120)
  email!: string;

  @IsOptional() @IsString() @MaxLength(20)
  celular?: string;

  @IsOptional() @IsString() @MaxLength(60) @Matches(TEXTO)
  numeroCompra?: string;

  @IsOptional() @IsString() @MaxLength(20)
  fechaCompra?: string;

  @IsOptional() @IsString() @MaxLength(200) @Matches(TEXTO)
  producto?: string;

  @IsOptional() @IsString() @MaxLength(60) @Matches(TEXTO)
  comprobante?: string;

  @IsString() @MinLength(5) @MaxLength(4000) @Matches(TEXTO)
  descripcion!: string;

  // Solo URLs de archivos subidos por /public/uploads/evidencia (se revisa en el servicio).
  @IsOptional() @IsArray() @ArrayMaxSize(8) @IsString({ each: true }) @MaxLength(400, { each: true })
  evidencias?: string[];

  @IsOptional() @IsString() @MaxLength(200)
  origen?: string;

  // Honeypot: un humano nunca lo llena.
  @IsOptional() @IsString() @MaxLength(200)
  website?: string;
}

export class ActualizarTicketDto {
  @IsOptional() @IsIn(ESTADOS_TICKET)
  estado?: (typeof ESTADOS_TICKET)[number];

  @IsOptional() @IsString() @MaxLength(2000)
  notas?: string;
}
