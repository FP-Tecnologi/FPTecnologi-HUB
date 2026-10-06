import { ArrayMaxSize, IsArray, IsBoolean, IsEmail, IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

const TEXTO = /^[^<>]*$/; // sin etiquetas: se muestran en el dashboard y en correos

export const TIPOS_TICKET = ['RECLAMO', 'VERIFICACION', 'SOPORTE'] as const;
export const ESTADOS_TICKET = ['NUEVO', 'EN_REVISION', 'ESPERANDO_CLIENTE', 'RESUELTO', 'CERRADO'] as const;
export const PRIORIDADES_TICKET = ['BAJA', 'NORMAL', 'ALTA', 'URGENTE'] as const;

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

  // Solo claves de archivos subidos por /public/uploads/evidencia (se revisan en el servicio).
  @IsOptional() @IsArray() @ArrayMaxSize(8) @IsString({ each: true }) @MaxLength(200, { each: true })
  evidencias?: string[];

  @IsOptional() @IsString() @MaxLength(200)
  origen?: string;

  // Honeypot: un humano nunca lo llena.
  @IsOptional() @IsString() @MaxLength(200)
  website?: string;
}

/** Seguimiento público: el número de ticket + el correo con el que se abrió hacen de «contraseña». */
export class SeguimientoTicketDto {
  @IsString() @MinLength(6) @MaxLength(30)
  numero!: string;

  @IsEmail() @MaxLength(120)
  email!: string;
}

export class ResponderTicketDto extends SeguimientoTicketDto {
  @IsString() @MinLength(2) @MaxLength(4000) @Matches(TEXTO)
  texto!: string;

  @IsOptional() @IsArray() @ArrayMaxSize(4) @IsString({ each: true }) @MaxLength(200, { each: true })
  adjuntos?: string[];
}

export class ActualizarTicketDto {
  @IsOptional() @IsIn(ESTADOS_TICKET)
  estado?: (typeof ESTADOS_TICKET)[number];

  @IsOptional() @IsIn(PRIORIDADES_TICKET)
  prioridad?: (typeof PRIORIDADES_TICKET)[number];

  @IsOptional() @IsString() @MaxLength(120)
  asignadoA?: string;

  @IsOptional() @IsString() @MaxLength(2000)
  notas?: string;
}

export class MensajeEquipoDto {
  @IsString() @MinLength(1) @MaxLength(4000) @Matches(TEXTO)
  texto!: string;

  /** true = nota interna (el cliente no la ve ni se le envía correo). */
  @IsOptional() @IsBoolean()
  interno?: boolean;

  @IsOptional() @IsIn(ESTADOS_TICKET)
  estado?: (typeof ESTADOS_TICKET)[number];
}
